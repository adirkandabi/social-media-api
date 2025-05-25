const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

function hashPassword(password) {
  return crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(password)
    .digest("hex");
}

function generateRandomString(length = 10) {
  // GENERATE RANDOM STRING FOR UNIQUE USER ID
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function generateRandomCode(length = 6) {
  // GENERATE RANDOM CODE FOR EMAIL VERIFICATION
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
async function sendVerificationEmail(email, code) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      to: email,
      subject: `LinkSpark - Verify your email`,
      html: `
        <table role="presentation" width="100%" height="50%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center" valign="middle" style="height:100vh;">
                    <div style="text-align:center; padding:60px;margin-top:-20rem;border:1px solid #ddd; border-radius:10px; max-width:400px;">
                        <p style="font-size:20px;">Your verification code is:</p>
                        <p style="font-size:25px;font-weight:bold;">${code}</p>
                        <p>Please enter it in the app.</p>
                    </div>
                </td>
            </tr>
        </table>
    `,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  hashPassword,
  generateRandomString,
  sendVerificationEmail,
  generateRandomCode,
};
