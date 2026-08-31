const {
  escapeHtml,
  renderEmailLayout,
  renderNotice,
  renderPrimaryButton,
} = require("./emailTheme");

const ResetPasswordTemplate = (user, url) => {
  const firstName = escapeHtml(user?.firstName || "there");
  const safeUrl = escapeHtml(url);
  const content = `
    <p style="margin: 0 0 10px; color: #162456; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 700; line-height: 24px;">
      Hello ${firstName},
    </p>
    <p style="margin: 0; color: #40517a; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 24px;">
      We received a request to reset the password for your DevsPark Labs account. Select the button below to choose a new password.
    </p>
    ${renderPrimaryButton("Reset password", url)}
    <p style="margin: 0 0 8px; color: #667599; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px;">
      If the button doesn’t work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0; word-break: break-all; color: #193cb8; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px;">
      <a href="${safeUrl}" target="_blank" style="color: #193cb8; text-decoration: underline;">${safeUrl}</a>
    </p>
    ${renderNotice({
      title: "Didn’t request this?",
      copy: "You can safely ignore this email. Your password will remain unchanged.",
    })}
  `;

  return renderEmailLayout({
    preheader: "Reset your DevsPark Labs account password securely.",
    eyebrow: "Password recovery",
    title: "Create a new password",
    content,
  });
};

module.exports = ResetPasswordTemplate;
