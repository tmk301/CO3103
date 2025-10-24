import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 5050; 


const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `http://localhost:${PORT}/oauth2callback`
);


app.get("/", (req, res) => {
  res.send("Truy cập /auth để đăng nhập Google.");
});

app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
  });
  res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Thiếu mã code từ Google");

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.json(tokens); // Trả token JSON về
  } catch (err) {
      console.error("Lỗi khi lấy token:", err.response?.data || err);
  res.status(500).json(err.response?.data || { message: "Không lấy được token" });
  }
});
app.get("/userinfo", async (req, res) => {
  const accessToken = req.query.token;
  if (!accessToken) {
    return res.status(400).send("Thiếu access_token trong URL, ví dụ: /userinfo?token=...");
  }

  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Lỗi lấy thông tin người dùng:", err);
    res.status(500).send("Không lấy được thông tin người dùng");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
  console.log(`Mở http://localhost:${PORT}/auth để bắt đầu xác thực Google`);
});
