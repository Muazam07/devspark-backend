const nodemailer = require("nodemailer");
const path = require("path");
const requestContext = require("./config/requestContext");

// CREATE TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// FUNCTION TO SEND EMAIL
const sendEmail = async (
  email,
  name,
  subject,
  htmlContent,
  label = "Email"
) => {
  let info;
  try {
    info = await transporter.sendMail({
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
  } catch (error) {
    requestContext.setEmail({ label, status: "Failed", reason: error.message });
    throw error;
  }

  requestContext.setEmail({
    label,
    status: "Sent",
    messageId: info.messageId,
  });
};

module.exports = sendEmail;
