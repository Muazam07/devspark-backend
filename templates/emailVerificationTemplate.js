const {
  escapeHtml,
  renderCodePanel,
  renderEmailLayout,
  renderSecurityReminder,
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
    <p style="margin: 0 0 10px; color: #162456; font-family: 'Mozilla Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; line-height: 24px;">
      Hello ${firstName},
    </p>
    <p style="margin: 0; color: #1c398e; font-family: 'Mozilla Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 15px; line-height: 25px;">
      ${introduction}
    </p>
    ${renderCodePanel(code)}
    <p style="margin: 0; color: #1c398e; font-family: 'Mozilla Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 23px; text-align: center;">
      This code expires in <strong style="color: #162456;">10 minutes</strong>.
    </p>
    ${renderSecurityReminder()}
  `;

  return renderEmailLayout({
    preheader: `${code} is your DevsPark Labs verification code.`,
    eyebrow: isPasswordReset ? "Password recovery" : "Email verification",
    title,
    content,
    documentTitle: isPasswordReset
      ? "DevsPark Password Reset"
      : "DevsPark Account Verification",
  });
};

module.exports = EmailVerificationTemplate;
