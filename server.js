const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const axios = require("axios");  // เปลี่ยนมาใช้ axios
const FormData = require("form-data");
const fs = require("fs");
const cors = require('cors');

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

const webhookURL = "https://discord.com/api/webhooks/1367500986007945367/HPBUY-hfMex_cn1Q3r3U8jiREDfrpIM3gJkyVs9nlLSu2cGRZYMx9yfjd9Lu4H0ULaia"; // ใส่ของคุณ

app.use(cors());

app.post("/upload", upload.single("image"), async (req, res) => {
  const filePath = req.file.path;

  try {
    const { data: { text } } = await Tesseract.recognize(filePath, "tha+eng");
    let cleanedText = text.replace(/[^a-zA-Z0-9ก-๙\s]/g, '').toLowerCase(); // ทำความสะอาดข้อความ
    cleanedText = cleanedText.replace("สําเร็จ", "สำเร็จ"); // แก้ไขคำผิดที่ OCR แปลงผิด

    console.log("OCR Text:", text);
    console.log("Cleaned OCR Text:", cleanedText);

    // คำสำคัญที่ต้องการตรวจสอบ
    const requiredKeywords = [
      "โอน", "บาท", "เวลา", "บัญชี", "scb", "กรุงไทย", "kbank", "transaction", "จำนวนเงิน", "เงิน", "สำเร็จ"
    ];

    const matched = requiredKeywords.filter(keyword => cleanedText.includes(keyword));
    console.log("Matched Keywords:", matched);

    // ตรวจสอบคำสำคัญที่พบ
    if (matched.length >= 3) {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      formData.append("payload_json", JSON.stringify({
        username: "VIP BOT",
        embeds: [{
          title: "✅ ตรวจสอบสลิปผ่านแล้ว",
          color: 65280,
          description: `ตรวจสอบสำเร็จ: ${matched.join(", ")}`,
          timestamp: new Date().toISOString()
        }]
      }));

      // ส่งข้อมูลไปที่ Discord Webhook
      const resp = await axios.post(webhookURL, formData, {
        headers: formData.getHeaders()  // ใช้ headers สำหรับการส่ง FormData
      });

      if (resp.status === 204) {
        res.json({ success: true, message: "ส่งข้อมูลเข้า Discord แล้ว" });
      } else {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการส่งข้อมูลไปที่ Discord" });
      }
    } else {
      res.status(400).json({ success: false, message: "ตรวจไม่พบคำสำคัญในสลิป" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการประมวลผลสลิป" });
  } finally {
    fs.unlinkSync(filePath); // ลบไฟล์ที่อัปโหลดหลังจากใช้แล้ว
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
