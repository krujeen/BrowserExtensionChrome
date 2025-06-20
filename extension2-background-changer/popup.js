// popup.js

// รอให้ DOM ของ Pop-up โหลดเสร็จก่อน
document.addEventListener('DOMContentLoaded', () => {
  // รับ Element ของปุ่มต่างๆ
  const redBtn = document.getElementById('redBtn');
  const blueBtn = document.getElementById('blueBtn');
  const greenBtn = document.getElementById('greenBtn');
  const resetBtn = document.getElementById('resetBtn');

  // ฟังก์ชันสำหรับส่งคำสั่งไปยัง Content Script เพื่อเปลี่ยนสี
  function changePageBackground(color) {
    // ดึงแท็บที่กำลังใช้งานอยู่
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // ตรวจสอบว่ามีแท็บและ URL ที่ถูกต้อง
      if (tabs[0] && tabs[0].url) {
        // ใช้ chrome.scripting.executeScript เพื่อรันฟังก์ชันใน Content Script
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id }, // กำหนดเป้าหมายเป็นแท็บปัจจุบัน
          function: setBackgroundColor, // ฟังก์ชันที่จะรันใน Content Script
          args: [color] // อาร์กิวเมนต์ที่ส่งไปให้ฟังก์ชัน
        });
      }
    });
  }

  // เพิ่ม Event Listener ให้กับปุ่มแต่ละปุ่ม
  redBtn.addEventListener('click', () => changePageBackground('red'));
  blueBtn.addEventListener('click', () => changePageBackground('blue'));
  greenBtn.addEventListener('click', () => changePageBackground('green'));
  resetBtn.addEventListener('click', () => changePageBackground('transparent')); // ใช้ transparent เพื่อรีเซ็ตเป็นค่าเริ่มต้น
});

// ฟังก์ชันนี้จะถูกฉีดและรันใน Content Script (ใน context ของหน้าเว็บ)
// ห้ามประกาศฟังก์ชันนี้ใน popup.js ตรงๆ เพราะมันจะถูกรันในบริบทของ popup
// ต้องส่งผ่าน chrome.scripting.executeScript เท่านั้น
function setBackgroundColor(color) {
  // เปลี่ยนสีพื้นหลังของ <body> ของหน้าเว็บ
  document.body.style.backgroundColor = color;
}
