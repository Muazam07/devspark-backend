const nodemailer = require("nodemailer");
const path = require("path");

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
    attachments: [
      {
        filename: "devspark-logo.png",
        path: path.join(__dirname, "templates/assets/devspark-logo.png"),
        cid: "devspark-logo",
      },
    ],
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
