const {
  escapeHtml,
  renderCodePanel,
  renderEmailLayout,
  renderNotice,
} = require("./emailTheme");

const EmailVerificationTemplate = (user, code, options = {}) => {
  const isPasswordReset = options.purpose === "password-reset";
  const firstName = escapeHtml(user?.firstName || "there");
  const title = isPasswordReset
    ? "Reset your password"
    : "Verify your email address";
  const introduction = isPasswordReset
    ? "We received a request to reset the password for your DevsPark Labs account. Use the code below to continue."
    : "Thanks for creating your DevsPark Labs account. Use the code below to confirm your email address.";

  const content = `
    <p style="margin: 0 0 10px; color: #162456; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 700; line-height: 24px;">
      Hello ${firstName},
    </p>
    <p style="margin: 0; color: #40517a; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 24px;">
      ${introduction}
    </p>
    ${renderCodePanel(code)}
    <p style="margin: 0; color: #40517a; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px;">
      This code expires in <strong style="color: #162456;">10 minutes</strong>. For your security, never share this code with anyone.
    </p>
    ${renderNotice({
      title: "Didn’t request this?",
      copy: isPasswordReset
        ? "You can safely ignore this email. Your password will remain unchanged."
        : "You can safely ignore this email if you did not create this account.",
    })}
  `;

  return renderEmailLayout({
    preheader: `${code} is your DevsPark Labs verification code.`,
    eyebrow: isPasswordReset ? "Password recovery" : "Email verification",
    title,
    content,
  });
};

module.exports = EmailVerificationTemplate;
