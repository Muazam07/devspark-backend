const nodemailer = require("nodemailer");

// CREATE TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// FUNCTION TO SEND EMAIL
const sendEmail = async (email, name, subject, htmlContent) => {
  const info = await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: subject,
    html: htmlContent,
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
