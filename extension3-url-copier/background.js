// background.js

// ดักจับเหตุการณ์เมื่อผู้ใช้คลิกที่ไอคอน Extension
chrome.action.onClicked.addListener(async (tab) => {
  // ตรวจสอบว่ามีแท็บและ URL ที่ถูกต้อง
  if (tab && tab.url) {
    const currentUrl = tab.url;
    console.log("พยายามคัดลอก URL:", currentUrl);

    try {
      // ใช้ chrome.scripting.executeScript เพื่อรันฟังก์ชันการคัดลอกในหน้าเว็บ
      // (นี่คือวิธีที่ปลอดภัยและได้รับอนุญาตสำหรับ Chrome Extension Manifest V3)
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: copyTextToClipboard, /* ฟังก์ชันที่จะรันใน Content Script */
        args: [currentUrl] /* อาร์กิวเมนต์ที่ส่งไปยังฟังก์ชัน */
      });

      // แสดง Notification เมื่อคัดลอกสำเร็จ
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png', /* ใช้ไอคอนของ Extension */
        title: 'คัดลอก URL สำเร็จ!',
        message: `URL: ${currentUrl} ถูกคัดลอกไปยังคลิปบอร์ดแล้ว`,
        priority: 2
      });

      console.log("URL ถูกคัดลอกสำเร็จ:", currentUrl);

    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการคัดลอก URL:", error);
      // แสดง Notification แจ้งข้อผิดพลาด
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'คัดลอก URL ไม่สำเร็จ',
        message: `ไม่สามารถคัดลอก URL: ${currentUrl} ได้`,
        priority: 0
      });
    }
  }
});

// ฟังก์ชันนี้จะถูกฉีดเข้าไปในหน้าเว็บและทำหน้าที่คัดลอกข้อความ
// **สำคัญ: ห้ามใช้ navigator.clipboard.writeText() โดยตรงใน Extension
// เพราะอาจมีข้อจำกัดด้านความปลอดภัยในบางบริบท ให้ใช้ document.execCommand('copy') แทน**
function copyTextToClipboard(text) {
  // สร้าง textarea ชั่วคราว
  const textarea = document.createElement('textarea');
  textarea.value = text; // กำหนดค่าข้อความที่จะคัดลอก
  document.body.appendChild(textarea); // เพิ่ม textarea ลงใน DOM

  // เลือกข้อความทั้งหมดใน textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // สำหรับมือถือ

  try {
    // สั่งคัดลอกข้อความ
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.error('Oops, unable to copy', err);
  } finally {
    // ลบ textarea ชั่วคราวออก
    document.body.removeChild(textarea);
  }
}
