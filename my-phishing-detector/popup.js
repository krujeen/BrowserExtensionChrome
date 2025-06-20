// popup.js

document.addEventListener('DOMContentLoaded', () => {
  // ดึง Elements ที่จำเป็นจาก popup.html
  const statusMessage = document.getElementById('status-message');
  const loadingSpinner = document.getElementById('loading-spinner');
  const resultDetails = document.getElementById('result-details');
  const currentUrlSpan = document.getElementById('current-url');
  const detectionStatusSpan = document.getElementById('detection-status');
  const rescanButton = document.getElementById('rescan-button');

  /**
   * ฟังก์ชันสำหรับอัปเดต UI ตามสถานะการตรวจจับ
   * @param {string} url - URL ของหน้าปัจจุบัน
   * @param {boolean} isPhishing - true ถ้าเป็นฟิชชิ่ง, false ถ้าไม่ใช่
   */
  function updateUI(url, isPhishing) {
    loadingSpinner.classList.add('hidden'); // ซ่อน Spinner

    currentUrlSpan.textContent = url;
    resultDetails.classList.remove('hidden'); // แสดงรายละเอียดผลลัพธ์
    rescanButton.classList.remove('hidden'); // แสดงปุ่มสแกนซ้ำ

    if (isPhishing) {
      statusMessage.textContent = 'พบเว็บไซต์ที่น่าสงสัย (Phishing)!';
      statusMessage.className = 'status-phishing'; // เปลี่ยน class เพื่อเปลี่ยนสี
      detectionStatusSpan.textContent = 'น่าสงสัย 🚨';
      detectionStatusSpan.className = 'status-phishing';
    } else {
      statusMessage.textContent = 'เว็บไซต์ดูปลอดภัย';
      statusMessage.className = 'status-safe'; // เปลี่ยน class เพื่อเปลี่ยนสี
      detectionStatusSpan.textContent = 'ปลอดภัย ✅';
      detectionStatusSpan.className = 'status-safe';
    }
  }

  /**
   * ฟังก์ชันสำหรับเริ่มต้นการตรวจสอบ URL
   */
  async function checkCurrentUrl() {
    statusMessage.textContent = 'กำลังตรวจสอบหน้าเว็บ...';
    statusMessage.className = 'status-checking';
    loadingSpinner.classList.remove('hidden'); // แสดง Spinner
    resultDetails.classList.add('hidden'); // ซ่อนรายละเอียดผลลัพธ์
    rescanButton.classList.add('hidden'); // ซ่อนปุ่มสแกนซ้ำ

    try {
      // ดึงแท็บที่ Active อยู่
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.url) {
        // ส่งข้อความไปยัง background script เพื่อขอให้ตรวจสอบ URL
        // background script จะตอบกลับด้วยผลลัพธ์จากฟังก์ชัน isPhishing()
        chrome.runtime.sendMessage({ action: "checkCurrentUrl" }, (response) => {
          if (response) {
            updateUI(response.url, response.isPhishing);
          } else {
            // กรณีที่ background script ไม่ตอบกลับ หรือมีข้อผิดพลาด
            loadingSpinner.classList.add('hidden');
            statusMessage.textContent = 'ไม่สามารถรับข้อมูลสถานะได้';
            statusMessage.className = 'status-checking';
          }
        });
      } else {
        // กรณีที่ไม่สามารถเข้าถึง URL ได้ (เช่น หน้า chrome://extensions)
        updateUI('ไม่สามารถเข้าถึง URL นี้ได้', false); // หรือตั้งค่าเป็นสถานะอื่น
      }
    } catch (error) {
      console.error("Error querying tabs or sending message:", error);
      loadingSpinner.classList.add('hidden');
      statusMessage.textContent = 'เกิดข้อผิดพลาดในการดึงข้อมูล';
      statusMessage.className = 'status-phishing';
    }
  }

  // เรียกใช้ฟังก์ชันตรวจสอบ URL ทันทีที่ Pop-up โหลดเสร็จ
  checkCurrentUrl();

  // เพิ่ม Event Listener ให้กับปุ่มสแกนซ้ำ
  rescanButton.addEventListener('click', checkCurrentUrl);
});
