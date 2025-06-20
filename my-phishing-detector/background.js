// background.js

// รายชื่อโดเมนฟิชชิ่งที่รู้จัก (ตัวอย่างง่ายๆ)
// ในการใช้งานจริง อาจจะต้องมีฐานข้อมูลที่ใหญ่ขึ้นและอัปเดตอยู่เสมอ
const knownPhishingDomains = [
  "fakebanklogin.com",
  "paypal-verify-account.net",
  "microsoft-security-alert.xyz",
  "amaz0n.co", // ตัวอย่าง typo
  "googlesignin.info"
];

// รายชื่อโดเมนที่ปลอดภัยและเชื่อถือได้ (ตัวอย่าง)
const safeDomains = [
  "google.com",
  "facebook.com",
  "microsoft.com",
  "amazon.com",
  "youtube.com",
  "wikipedia.org"
];

/**
 * ฟังก์ชันสำหรับตรวจสอบว่า URL เป็นฟิชชิ่งหรือไม่
 * นี่คือ Logic การตรวจจับเบื้องต้น
 * @param {string} urlString - URL ที่ต้องการตรวจสอบ
 * @returns {boolean} true ถ้าเป็นฟิชชิ่ง, false ถ้าไม่ใช่
 */
function isPhishing(urlString) {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    // 1. ตรวจสอบ Blacklist
    if (knownPhishingDomains.some(domain => hostname.includes(domain))) {
      console.warn(`[Phishing Detector] Blacklist match: ${hostname}`);
      return true;
    }

    // 2. ตรวจสอบความคล้ายคลึงของโดเมน (Homoglyph / Typo squatting)
    // นี่เป็น heuristic ที่ง่ายมาก สามารถทำให้ซับซ้อนขึ้นได้โดยใช้ Levenshtein distance
    // หรือการตรวจสอบ homoglyph libraries
    const normalizedHostname = hostname.toLowerCase()
      .replace(/0/g, 'o') // 0 -> o
      .replace(/1/g, 'l') // 1 -> l
      .replace(/3/g, 'e') // 3 -> e
      .replace(/@/g, 'a'); // @ -> a

    for (const safeDomain of safeDomains) {
      const normalizedSafeDomain = safeDomain.toLowerCase()
        .replace(/0/g, 'o')
        .replace(/1/g, 'l')
        .replace(/3/g, 'e')
        .replace(/@/g, 'a');

      // ตรวจสอบว่า hostname ที่ถูก Normalize มีส่วนหนึ่งส่วนใดคล้ายกับ safeDomain
      // และไม่เป็น safeDomain เป๊ะๆ (เพื่อหลีกเลี่ยง False Positive)
      if (normalizedHostname.includes(normalizedSafeDomain) && hostname !== safeDomain) {
        console.warn(`[Phishing Detector] Suspicious domain similarity: ${hostname} vs ${safeDomain}`);
        return true;
      }
    }

    // 3. ตรวจสอบการใช้ IP Address แทนชื่อโดเมน
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(hostname)) {
      console.warn(`[Phishing Detector] IP address used in URL: ${hostname}`);
      return true;
    }

    // 4. ตรวจสอบ URL ที่ยาวและมี Subdomain ซับซ้อนผิดปกติ (อาจเป็นแนวทางหนึ่ง)
    // เช่น https://www.login.secure.account-update.phishing.site.com
    const parts = hostname.split('.');
    if (parts.length > 4) { // ถ้ามี subdomain เยอะเกินไป อาจน่าสงสัย
        console.warn(`[Phishing Detector] Unusual number of subdomains: ${hostname}`);
        // return true; // เปิดใช้งานถ้าต้องการความเข้มงวดมากขึ้น
    }

    // 5. ตรวจสอบการใช้ HTTP บนเว็บไซต์ที่ควรเป็น HTTPS
    if (url.protocol === 'http:' && safeDomains.some(domain => hostname.endsWith(domain))) {
      console.warn(`[Phishing Detector] HTTP used for a known secure domain: ${urlString}`);
      return true;
    }

  } catch (e) {
    console.error(`[Phishing Detector] Error parsing URL: ${urlString}`, e);
    return false; // ไม่สามารถ parse URL ได้ ถือว่าไม่เข้าข่ายฟิชชิ่งจาก Logic นี้
  }
  return false; // ไม่พบสิ่งบ่งชี้ว่าเป็นฟิชชิ่ง
}

// ดักจับเหตุการณ์เมื่อแท็บมีการโหลดหน้าเว็บเสร็จสมบูรณ์
chrome.webNavigation.onCompleted.addListener((details) => {
  // ตรวจสอบเฉพาะ Main Frame (หน้าเว็บหลัก ไม่ใช่ iframe) และตรวจสอบว่ามี URL
  if (details.frameId === 0 && details.url) {
    const currentUrl = details.url;
    console.log(`[Phishing Detector] ตรวจสอบ URL: ${currentUrl}`);

    // ตรวจสอบว่า URL เป็นฟิชชิ่งหรือไม่
    const isDetectedPhishing = isPhishing(currentUrl);

    if (isDetectedPhishing) {
      console.warn(`[Phishing Detector] พบเว็บไซต์ที่น่าสงสัย: ${currentUrl}`);

      // 1. แสดง Notification ให้ผู้ใช้เห็น
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png', // ใช้ไอคอนของ Extension
        title: 'Phishing Alert!',
        message: `เว็บไซต์นี้ (${currentUrl}) อาจเป็นการหลอกลวง (Phishing)! โปรดระมัดระวัง`,
        priority: 2
      });

      // 2. ส่งข้อความไปยัง Content Script เพื่อแสดง Alert/Warning ในหน้าเว็บ
      // ตรวจสอบให้แน่ใจว่า URL เป็น HTTP(S) เพื่อหลีกเลี่ยงข้อผิดพลาดกับ chrome:// หรือ file://
      if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
          chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            function: displayInPageWarning,
            args: [currentUrl]
          }).then(() => console.log('In-page warning script executed.')).catch(error => console.error('Failed to execute in-page warning script:', error));
      }
    } else {
      console.log(`[Phishing Detector] URL ดูปลอดภัย: ${currentUrl}`);
    }
  }
});

// ฟังก์ชันที่จะถูกฉีดเข้าไปในหน้าเว็บโดย chrome.scripting.executeScript
// เพื่อแสดงคำเตือนโดยตรงบนหน้าเว็บ
function displayInPageWarning(url) {
  // ตรวจสอบว่าแถบเตือนยังไม่มีอยู่
  if (document.getElementById('phishing-detector-warning-bar')) {
    return;
  }

  const warningBar = document.createElement('div');
  warningBar.id = 'phishing-detector-warning-bar';
  warningBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #dc3545; /* สีแดง */
    color: white;
    text-align: center;
    padding: 15px;
    z-index: 2147483647; /* ค่า z-index สูงสุด เพื่อให้แสดงทับทุกอย่าง */
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  `;
  warningBar.innerHTML = `
    <span>🚨 คำเตือน: เว็บไซต์นี้ (${url}) อาจเป็นการหลอกลวง (Phishing)! โปรดระมัดระวังเป็นอย่างยิ่ง 🚨</span>
    <button style="
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      margin-left: 15px;
    " onclick="this.parentNode.remove()">×</button>
  `;

  // เพิ่มแถบเตือนไปที่ด้านบนสุดของ body
  document.body.prepend(warningBar);
}

// Listener สำหรับรับข้อความจาก popup.js (ถ้ามี)
// เพื่อให้ popup สามารถขอสถานะการตรวจจับ URL ปัจจุบันได้
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkCurrentUrl") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const currentUrl = tabs[0].url;
        const isDetected = isPhishing(currentUrl);
        sendResponse({ url: currentUrl, isPhishing: isDetected });
      } else {
        sendResponse({ url: "ไม่มี URL", isPhishing: false });
      }
    });
    // ต้อง return true เพื่อระบุว่า sendResponse จะถูกเรียกแบบ asynchronous
    return true;
  }
});
