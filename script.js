document.getElementById("vipForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const discordName = document.getElementById("discordName").value.trim();
  const imageFile = document.getElementById("image").files[0];
  const preview = document.getElementById("preview");

  // ตรวจสอบเบื้องต้น
  if (!discordName || !imageFile) {
    alert("กรุณากรอกชื่อ Discord และเลือกรูปสลิป");
    return;
  }

  // ตรวจขนาด/ประเภทไฟล์
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(imageFile.type)) {
    alert("กรุณาอัปโหลดรูป JPG, PNG หรือ WEBP เท่านั้น");
    return;
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    alert("ขนาดรูปต้องไม่เกิน 5MB");
    return;
  }

  // แสดงสถานะ
  preview.innerHTML = "📤 กำลังตรวจสอบสลิป...";

  // เตรียมส่งไปยังเซิร์ฟเวอร์
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("discordName", discordName); // จะใช้ฝั่งเซิร์ฟเวอร์ต่อไป (ถ้าต้องการแนบชื่อด้วย)

  try {
    const res = await fetch("https://alex-goe6.onrender.com/upload", {
      method: "POST",
      body: formData
    });

    // ตรวจสอบสถานะของการตอบกลับ
    if (!res.ok) {
      // หากไม่ได้รับการตอบกลับที่สมบูรณ์จากเซิร์ฟเวอร์ (เช่น 400, 500)
      preview.innerHTML = `❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: ${res.statusText}`;
      return;
    }

    const result = await res.json();

    if (result.success) {
      // หากสลิปได้รับการตรวจสอบสำเร็จ
      preview.innerHTML = `สลิปได้ถูกตรวจสอบแล้ว: ${result.message}`;
    } else {
      // หากสลิปผิด
      preview.innerHTML = `สลิปผิด: ${result.message || 'กรุณาใส่รูปภาพที่ถูกต้อง'}`;
    }
  } catch (err) {
    preview.innerHTML = `❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์`;
    console.error("Error details:", err);
  }
});
