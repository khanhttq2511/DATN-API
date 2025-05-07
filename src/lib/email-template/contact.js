
const contactTemplate = (email, name, message) => {
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
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Inquiry</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
  <table width="100%" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px;">
    <tr>
      <td>
        <h2 style="color: #333;">📬 New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${formattedDate}</p>
        <p><strong>Message:</strong></p>
        <div style="border: 1px solid #ddd; padding: 10px; background: #fafafa; border-radius: 4px;">
          ${message}
        </div>
        <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">This message was sent from the contact form on your website.</p>
      </td>
    </tr>
  </table>
</body>
</html> `;
};

module.exports = {
    contactTemplate
}
