const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Khởi tạo và export transporter để sử dụng ở khắp nơi
let transporter = null;

// Hàm khởi tạo transporter
async function createTransporter() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MY_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    return transporter;
  } catch (error) {
    console.error("Error creating mail transporter:", error);
    throw error;
  }
}

// Hàm gửi email có thể được tái sử dụng
async function sendMail(mailOptions) {
  try {
    const { to, subject, html } = mailOptions;
    // Đảm bảo transporter đã được khởi tạo
    if (!transporter) {
      await createTransporter();
    }
    if (!to || !subject || !html) {
      throw new Error("Missing required fields");
    }
    // Nếu không cung cấp mailOptions, sử dụng mặc định
    const options = mailOptions || {
      from: process.env.MY_EMAIL,
      to: to || "",
      subject: subject || "",
      html: html || "",
    };

    const result = await transporter.sendMail(options);
    return "Email sent successfully";
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Hàm gửi email có thể được tái sử dụng
async function sendMailContact(mailOptions) {
  try {
    const { email, subject, html } = mailOptions;
    // Đảm bảo transporter đã được khởi tạo
    if (!transporter) {
      await createTransporter();
    }
    
    if (!email || !subject || !html) {
      throw new Error("Missing required fields");
    }
    
    // Nếu không cung cấp mailOptions, sử dụng mặc định
    const options = {
      from: process.env.MY_EMAIL || "",
      to: process.env.SUPPORT_EMAIL || "",
      subject: subject || "",
      replyTo: email,
      html: html || "",
    };

    const result = await transporter.sendMail(options);
    return "Email sent successfully";
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
// Xuất các hàm để sử dụng ở các file khác
module.exports = {
  createTransporter,
  sendMail,
  sendMailContact
};
