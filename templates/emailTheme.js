const brand = Object.freeze({
  accent: "#53eafd",
  accentDark: "#0092b8",
  accentSoft: "#ecfeff",
  active: "#193cb8",
  background: "#f5f5f5",
  border: "#e5e5e5",
  copy: "#1c398e",
  highlight: "#00b8db",
  ink: "#162456",
  muted: "#52628a",
  white: "#ffffff",
});

const fontFamily =
  "'Mozilla Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderCodePanel = (code) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
    <tr>
      <td align="center">
        <div class="email-code-panel" style="width: 100%; max-width: 390px; box-sizing: border-box; border: 2px dashed ${brand.active}; border-radius: 16px; background-color: ${brand.accentSoft}; padding: 20px 18px 22px; text-align: center;">
          <p style="margin: 0 0 8px; color: ${brand.accentDark}; font-family: ${fontFamily}; font-size: 10px; font-weight: 700; line-height: 15px; letter-spacing: 1.6px; text-transform: uppercase;">
            Verification code
          </p>
          <p class="email-code" style="margin: 0; color: ${brand.active}; font-family: 'Geist Mono', 'Courier New', Courier, monospace; font-size: 38px; font-weight: 700; line-height: 46px; letter-spacing: 9px;">
            ${escapeHtml(code)}
          </p>
        </div>
        <p style="margin: 13px 0 0; color: ${brand.muted}; font-family: ${fontFamily}; font-size: 12px; line-height: 18px;">
          Enter this code in the DevsPark verification screen.
        </p>
      </td>
    </tr>
  </table>
`;

const renderPrimaryButton = (label, url) => {
  const safeUrl = escapeHtml(url);

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
      <tr>
        <td class="email-button" align="center" bgcolor="${brand.accent}" style="border-radius: 999px; background-color: ${brand.accent};">
          <a href="${safeUrl}" target="_blank" style="display: inline-block; padding: 14px 24px; color: ${brand.ink}; font-family: ${fontFamily}; font-size: 14px; font-weight: 600; line-height: 20px; text-decoration: none;">
            ${escapeHtml(label)} &nbsp;&rarr;
          </a>
        </td>
      </tr>
    </table>
  `;
};

const renderNotice = ({ title, copy }) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
    <tr>
      <td style="border: 1px solid ${brand.border}; border-radius: 12px; background-color: #f8fafc; padding: 17px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" width="38" style="padding-right: 12px;">
              <div style="width: 32px; height: 32px; border-radius: 16px; background-color: ${brand.accentSoft}; color: ${brand.accentDark}; font-family: ${fontFamily}; font-size: 16px; font-weight: 800; line-height: 32px; text-align: center;">
                !
              </div>
            </td>
            <td valign="top">
              <p style="margin: 0 0 2px; color: ${brand.ink}; font-family: ${fontFamily}; font-size: 13px; font-weight: 700; line-height: 19px;">
                ${escapeHtml(title)}
              </p>
              <p style="margin: 0; color: ${brand.muted}; font-family: ${fontFamily}; font-size: 13px; line-height: 20px;">
                ${escapeHtml(copy)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const renderSecurityReminder = () => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
    <tr>
      <td width="4" bgcolor="${brand.highlight}" style="width: 4px; border-radius: 12px 0 0 12px; background-color: ${brand.highlight}; font-size: 0; line-height: 0;">
        &nbsp;
      </td>
      <td style="border: 1px solid ${brand.border}; border-left: 0; border-radius: 0 12px 12px 0; background-color: #f8fafc; padding: 17px 18px;">
        <p style="margin: 0 0 7px; color: ${brand.ink}; font-family: ${fontFamily}; font-size: 13px; font-weight: 800; line-height: 19px;">
          Security reminder
        </p>
        <p style="margin: 0 0 3px; color: ${brand.muted}; font-family: ${fontFamily}; font-size: 12px; line-height: 19px;">
          &bull;&nbsp; DevsPark will never ask you to share this code.
        </p>
        <p style="margin: 0; color: ${brand.muted}; font-family: ${fontFamily}; font-size: 12px; line-height: 19px;">
          &bull;&nbsp; If you did not request it, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
`;

const renderEmailLayout = ({
  preheader,
  eyebrow,
  title,
  content,
  documentTitle = title,
}) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <title>${escapeHtml(documentTitle)}</title>
    <style>
      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }

      table,
      td {
        border-collapse: collapse !important;
      }

      img {
        border: 0;
        display: block;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }

      a {
        color: ${brand.active};
      }

      @media only screen and (max-width: 620px) {
        .email-wrapper {
          padding: 20px 12px !important;
        }

        .email-shell {
          width: 100% !important;
          border-radius: 16px !important;
        }

        .email-header,
        .email-hero,
        .email-content,
        .email-footer {
          padding-left: 22px !important;
          padding-right: 22px !important;
        }

        .email-hero {
          padding-top: 28px !important;
          padding-bottom: 27px !important;
        }

        .email-content {
          padding-top: 28px !important;
          padding-bottom: 30px !important;
        }

        .email-title {
          font-size: 27px !important;
          line-height: 34px !important;
        }

        .email-code {
          font-size: 31px !important;
          line-height: 40px !important;
          letter-spacing: 6px !important;
        }

        .email-code-panel {
          width: 100% !important;
        }

        .email-security-label {
          display: none !important;
        }

        .email-button,
        .email-button a {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${brand.background}; color: ${brand.copy};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; line-height: 1px; mso-hide: all;">
      ${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.background}" style="width: 100%; background-color: ${brand.background};">
      <tr>
        <td class="email-wrapper" align="center" style="padding: 48px 16px 36px;">
          <table class="email-shell" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; overflow: hidden; border: 1px solid ${brand.border}; border-radius: 18px; background-color: ${brand.white}; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.09);">
            <tr>
              <td class="email-header" bgcolor="${brand.white}" style="padding: 23px 34px; background-color: ${brand.white};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle">
                      <img src="cid:devspark-logo" width="150" alt="DevsPark Labs" style="display: block; width: 150px; max-width: 100%; height: auto;" />
                    </td>
                    <td class="email-security-label" valign="middle" align="right">
                      <span style="display: inline-block; border: 1px solid ${brand.border}; border-radius: 999px; padding: 6px 10px; color: ${brand.muted}; font-family: ${fontFamily}; font-size: 9px; font-weight: 700; line-height: 13px; letter-spacing: 1px; text-transform: uppercase;">
                        Secure account message
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td height="3" bgcolor="${brand.accent}" style="height: 3px; background-color: ${brand.accent}; background-image: linear-gradient(90deg, #53eafd 0%, #00b8db 50%, #193cb8 100%); font-size: 0; line-height: 0;">
                &nbsp;
              </td>
            </tr>
            <tr>
              <td class="email-hero" bgcolor="#f8fbff" style="padding: 34px 40px 33px; background-color: #f8fbff; background-image: radial-gradient(circle at top right, #ecfeff 0%, #f8fbff 46%, #f8fbff 100%);">
                <p style="margin: 0 0 9px; color: ${brand.active}; font-family: ${fontFamily}; font-size: 10px; font-weight: 700; line-height: 15px; letter-spacing: 1.7px; text-transform: uppercase;">
                  ${escapeHtml(eyebrow)}
                </p>
                <h1 class="email-title" style="margin: 0; color: ${brand.ink}; font-family: ${fontFamily}; font-size: 32px; font-weight: 400; line-height: 39px; letter-spacing: -0.7px;">
                  ${escapeHtml(title)}
                </h1>
              </td>
            </tr>
            <tr>
              <td class="email-content" style="padding: 34px 40px 38px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td class="email-footer" bgcolor="${brand.ink}" style="padding: 30px 40px 31px; background-color: ${brand.ink}; background-image: linear-gradient(135deg, #162456 0%, #1c2f6e 52%, #193cb8 100%);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <p style="margin: 0 0 7px; color: ${brand.white}; font-family: ${fontFamily}; font-size: 17px; font-weight: 800; line-height: 23px; letter-spacing: 0.2px;">
                        DEVSPARK <span style="color: ${brand.accent};">LABS</span>
                      </p>
                      <p style="margin: 0 0 17px; color: #cbd5e1; font-family: ${fontFamily}; font-size: 12px; line-height: 18px;">
                        Building dependable digital products.
                      </p>
                      <p style="margin: 0 0 4px; color: #94a3b8; font-family: ${fontFamily}; font-size: 10px; line-height: 16px;">
                        &copy; ${new Date().getFullYear()} DevsPark Labs. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #94a3b8; font-family: ${fontFamily}; font-size: 10px; line-height: 16px;">
                        Automated security email &nbsp;&bull;&nbsp; <a href="mailto:info@devsparklabs.com" style="color: ${brand.accent}; text-decoration: none;">Contact support</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin: 16px 0 0; color: #94a3b8; font-family: ${fontFamily}; font-size: 10px; line-height: 16px; text-align: center;">
            Please do not reply directly to this message.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = {
  escapeHtml,
  renderCodePanel,
  renderEmailLayout,
  renderNotice,
  renderPrimaryButton,
  renderSecurityReminder,
};
