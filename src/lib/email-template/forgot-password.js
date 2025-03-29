// email template for forgot password with improved design
const forgotPasswordTemplate = (otp, name) => {
    // Format date nicely
    const today = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = today.toLocaleDateString('vi-VN', dateOptions);

    return `
    <!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Smart Home - Password Reset</title>
  </head>
  <body style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    ">
    <div style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: linear-gradient(135deg, #f4f7ff 0%, #e8eeff 100%);
        border-radius: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        font-size: 14px;
        color: #434343;
      ">
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td>
                <div style="
                    font-size: 24px;
                    font-weight: bold;
                    color: #1a73e8;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                  ">Smart Home</div>
              </td>
              <td style="text-align: right;">
                <span style="
                    font-size: 15px;
                    line-height: 30px;
                    color: #1a73e8;
                    background: rgba(26, 115, 232, 0.1);
                    padding: 8px 20px;
                    border-radius: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    font-weight: 500;
                  ">${formattedDate}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div style="
            margin: 0;
            margin-top: 40px;
            padding: 50px 30px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          ">
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <h1 style="
                margin: 0;
                font-size: 28px;
                font-weight: 600;
                color: #1f1f1f;
                margin-bottom: 15px;
              ">🔐 Xác Thực Tài Khoản</h1>
            
            <div style="
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #1a73e8, #34a853);
                margin: 0 auto 25px;
                border-radius: 2px;
              "></div>

            <p style="
                margin: 0;
                font-size: 18px;
                font-weight: 500;
                color: #333;
              ">Xin chào ${name} thân mến! 👋</p>
            
            <p style="
                margin: 20px 0;
                font-size: 16px;
                line-height: 1.8;
                color: #666;
              ">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ bạn. 
              Để tiếp tục quá trình này, vui lòng sử dụng mã xác thực dưới đây:
            </p>

            <div style="
                margin: 35px 0;
                padding: 25px;
                background: linear-gradient(135deg, #1a73e8 0%, #34a853 100%);
                border-radius: 15px;
                box-shadow: 0 4px 15px rgba(26, 115, 232, 0.2);
                position: relative;
                overflow: hidden;
              ">
              <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent);
                  background-size: 20px 20px;
                  opacity: 0.2;
              "></div>
              <p style="
                  margin: 0;
                  font-size: 42px;
                  font-weight: 700;
                  letter-spacing: 25px;
                  color: #ffffff;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  position: relative;
                ">${otp}</p>
            </div>

            <p style="
                font-size: 14px;
                color: #666;
                margin-top: 30px;
                font-style: italic;
                background: rgba(255, 193, 7, 0.1);
                padding: 12px 20px;
                border-radius: 10px;
                display: inline-block;
              ">
              ⏰ Lưu ý: Mã OTP này sẽ hết hạn sau 5 phút
            </p>
          </div>
        </div>

        <p style="
            max-width: 400px;
            margin: 30px auto 0;
            text-align: center;
            font-weight: 500;
            color: #666;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          ">
          💡 Cần hỗ trợ? Liên hệ ngay
          <a href="mailto:khanhttq2511@gmail.com"
             style="
               color: #1a73e8;
               text-decoration: none;
               font-weight: 600;
               border-bottom: 2px solid #1a73e8;
               transition: all 0.3s ease;
             ">khanhttq2511@gmail.com</a>
        </p>
      </main>

      <footer style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.1);
        ">
        <p style="
            color: #666;
            font-size: 13px;
          ">© ${new Date().getFullYear()} Smart Home. Mọi quyền được bảo lưu ❤️</p>
      </footer>
    </div>
  </body>
</html>
    `;
};

module.exports = {
    forgotPasswordTemplate
}