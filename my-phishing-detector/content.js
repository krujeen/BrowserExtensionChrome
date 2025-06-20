// content.js
// ไฟล์นี้จะถูกรันในบริบทของหน้าเว็บแต่ละหน้า

// ในโปรเจกต์นี้ ฟังก์ชัน `displayInPageWarning` ถูกฉีดโดยตรงจาก `background.js`
// ดังนั้นไฟล์ `content.js` เองจึงไม่จำเป็นต้องมีโค้ดใดๆ หากไม่มีการทำงานอื่นที่ต้องการ
// ให้มันทำงานอยู่ตลอดเวลาในหน้าเว็บ.
// เรายังคงรวมไฟล์นี้ไว้ในโครงสร้างเพื่อความสมบูรณ์และเพื่อให้เห็นว่า
// นี่คือจุดที่คุณจะเพิ่ม Logic ที่โต้ตอบกับ DOM ของหน้าเว็บโดยตรง
// หากคุณต้องการฟังก์ชันการทำงานที่ซับซ้อนกว่าการฉีดฟังก์ชันโดยตรงจาก background.js

console.log("Phishing Detector Content Script loaded.");

// ตัวอย่าง: หากคุณต้องการให้ Content Script ดักฟังข้อความจาก Background Script
// และทำการบางอย่างบนหน้าเว็บ
/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showCustomWarning") {
    // โค้ดสำหรับแสดงแถบเตือนแบบกำหนดเองในหน้าเว็บ
    const customWarningDiv = document.createElement('div');
    customWarningDiv.textContent = request.message;
    customWarningDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; background-color: orange; padding: 10px; z-index: 99999;';
    document.body.prepend(customWarningDiv);
    sendResponse({ status: "warning shown" });
  }
});
*/
