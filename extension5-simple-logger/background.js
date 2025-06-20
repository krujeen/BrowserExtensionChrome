// background.js

// ดักจับเหตุการณ์เมื่อการนำทางในแท็บเสร็จสมบูรณ์ (หน้าเว็บโหลดเสร็จ)
// webNavigation.onCompleted จะทำงานเมื่อหน้าเว็บโหลดเสร็จสมบูรณ์ รวมถึง iframe
chrome.webNavigation.onCompleted.addListener((details) => {
  // ตรวจสอบว่าเป็นการนำทางหลักของแท็บ (main frame) เพื่อหลีกเลี่ยงการบันทึกซ้ำซ้อนจาก iframe
  if (details.frameId === 0) {
    const timestamp = new Date().toLocaleString(); // เวลาปัจจุบัน
    const url = details.url; // URL ของหน้าเว็บที่โหลดเสร็จ

    // บันทึกข้อมูลลงใน Console ของ Service Worker
    console.log(`[${timestamp}] Page Loaded: ${url}`);
  }
});

// คุณสามารถเพิ่ม Listener อื่นๆ ได้ เช่น
// chrome.webNavigation.onBeforeNavigate.addListener((details) => {
//   console.log("กำลังจะไป:", details.url);
// });

// chrome.webNavigation.onErrorOccurred.addListener((details) => {
//   console.error("เกิดข้อผิดพลาดในการโหลด:", details.url, details.error);
// });

// เพื่อดู Console ของ Service Worker:
// 1. ไปที่ chrome://extensions/
// 2. คลิกที่ "Inspect views: service worker" ใต้ Extension "Simple Logger"
// 3. หน้าต่าง Developer Tools จะเปิดขึ้นมา ไปที่แท็บ "Console"
