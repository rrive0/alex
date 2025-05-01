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
      const res = await fetch("https://alex-goe6.onrender.com", {
        method: "POST",
        body: formData
      });
  
      const result = await res.json();
  
      if (result.success) {
        preview.innerHTML = `✅ ตรวจสอบและส่งเข้า Discord สำเร็จ`;
      } else {
        preview.innerHTML = `❌ ไม่ผ่านการตรวจสอบ: ${result.message}`;
      }
    } catch (err) {
      preview.innerHTML = `❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์`;
      console.error(err);
    }
  });
  
