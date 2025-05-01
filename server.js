const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const axios = require("axios");  // ใช้ axios
const FormData = require("form-data");
const fs = require("fs");
const cors = require('cors');

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

const webhookURL = "https://discord.com/api/webhooks/1367500986007945367/HPBUY-hfMex_cn1Q3r3U8jiREDfrpIM3gJkyVs9nlLSu2cGRZYMx9yfjd9Lu4H0ULaia"; // ใส่ของคุณ

app.use(cors());
app.use(express.json()); // เพิ่ม middleware สำหรับ body parsing

app.post("/upload", upload.single("image"), async (req, res) => {
  const filePath = req.file.path;
  const discordName = req.body.discordName;  // ชื่อ Discord ที่ส่งมาจากฟอร์ม

  // ต้องมั่นใจว่า discordName เป็นหมายเลข ID ของ Discord
  if (!discordName || isNaN(discordName)) {
    return res.status(400).json({ success: false, message: "กรุณาใช้ Discord ID แทนชื่อ Discord" });
  }

  try {
    const { data: { text } } = await Tesseract.recognize(filePath, "tha+eng");
    let cleanedText = text.replace(/[^a-zA-Z0-9ก-๙\s]/g, '').toLowerCase();
    cleanedText = cleanedText.replace("สําเร็จ", "สำเร็จ");

    const requiredKeywords = [
      "โอน", "บาท", "เวลา", "บัญชี", "scb", "กรุงไทย", "kbank", "transaction", "จำนวนเงิน", "เงิน", "สำเร็จ"
    ];

    const matched = requiredKeywords.filter(keyword => cleanedText.includes(keyword));

    if (matched.length >= 3) {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));

      formData.append("payload_json", JSON.stringify({
        username: "VIP BOT",
        embeds: [{
          title: "✅ ตรวจสอบสลิปผ่านแล้ว",
          color: 65280,
          description: `ตรวจสอบสำเร็จ: ${matched.join(", ")}`,
          fields: [{
            name: "ชื่อ Discord",
            value: `<@${discordName}>` // ใช้ Discord ID แทนชื่อเพื่อแท็ก
          }],
          timestamp: new Date().toISOString()
        }]
      }));

      const resp = await axios.post(webhookURL, formData, {
        headers: formData.getHeaders() 
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
  console.log(`Server started on https://alex-goe6.onrender.com:${PORT}`);
});
