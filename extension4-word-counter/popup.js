// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const wordCountStatus = document.getElementById('wordCountStatus');
  const loadingSpinner = document.getElementById('loadingSpinner');

  // แสดง Spinner และซ่อนข้อความสถานะ
  loadingSpinner.style.display = 'block';
  wordCountStatus.textContent = '';

  // ดึงแท็บที่กำลังใช้งานอยู่
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    // ตรวจสอบว่ามีแท็บและ URL ที่ถูกต้อง
    if (tabs[0] && tabs[0].url) {
      try {
        // รันฟังก์ชัน countWords ในแท็บปัจจุบันโดยใช้ scripting API
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: countWordsInPage, /* ฟังก์ชันที่จะรันใน Content Script */
        });

        // ผลลัพธ์จะอยู่ใน results[0].result
        const wordCount = results[0].result;

        // ซ่อน Spinner และแสดงผลลัพธ์
        loadingSpinner.style.display = 'none';
        wordCountStatus.innerHTML = `จำนวนคำทั้งหมด: <strong>${wordCount}</strong> คำ`;
        console.log("จำนวนคำ:", wordCount);

      } catch (error) {
        // ซ่อน Spinner และแสดงข้อผิดพลาด
        loadingSpinner.style.display = 'none';
        wordCountStatus.textContent = 'ไม่สามารถนับคำได้: ' + error.message;
        wordCountStatus.style.color = 'red';
        console.error("เกิดข้อผิดพลาดในการนับคำ:", error);
      }
    } else {
      // ซ่อน Spinner และแจ้งว่าไม่สามารถเข้าถึงแท็บได้
      loadingSpinner.style.display = 'none';
      wordCountStatus.textContent = 'ไม่สามารถเข้าถึงหน้าเว็บปัจจุบันได้';
      wordCountStatus.style.color = 'orange';
    }
  });
});

// ฟังก์ชันนี้จะถูกฉีดและรันใน Content Script (ใน context ของหน้าเว็บ)
function countWordsInPage() {
  // ดึงข้อความทั้งหมดจาก body ของหน้าเว็บ
  // ไม่รวม script, style, และ element ที่ซ่อนอยู่
  const text = document.body.innerText || document.body.textContent;

  // กรองตัวอักษรที่ไม่ใช่ตัวอักษรและตัวเลขออก, แยกคำด้วยช่องว่าง
  // ใช้ regular expression เพื่อแยกคำ
  const words = text.match(/\b\w+\b/g);

  // ส่งคืนจำนวนคำ ถ้าไม่มีคำเลยจะคืน 0
  return words ? words.length : 0;
}
