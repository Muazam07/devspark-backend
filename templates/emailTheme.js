const brand = Object.freeze({
  accent: "#53eafd",
  accentSoft: "#ecfeff",
  active: "#193cb8",
  background: "#f3f6fb",
  border: "#dbe3f0",
  copy: "#40517a",
  ink: "#162456",
  muted: "#667599",
  white: "#ffffff",
});

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
      <td align="center" bgcolor="${brand.accentSoft}" style="border: 1px solid #a2eef8; border-radius: 20px; background-color: ${brand.accentSoft}; background-image: linear-gradient(135deg, #f2fdff 0%, #edf5ff 100%); padding: 16px; box-shadow: 0 12px 28px rgba(25, 60, 184, 0.08);">
        <p style="margin: 0 0 5px; color: ${brand.active}; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: 700; line-height: 16px; letter-spacing: 1.7px; text-transform: uppercase;">
          Your verification code
        </p>
        <p class="email-code" style="margin: 10px 0 0; color: ${brand.ink}; font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 700; line-height: 46px; letter-spacing: 10px;">
          ${escapeHtml(code)}
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
        <td class="email-button" align="center" bgcolor="${brand.accent}" style="border-radius: 999px;">
          <a href="${safeUrl}" target="_blank" style="display: inline-block; padding: 14px 26px; color: #053345; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700; line-height: 20px; text-decoration: none;">
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
      <td style="border: 1px solid ${brand.border}; border-radius: 14px; background-color: #f7f9fd; padding: 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" width="42">
              <div style="width: 32px; height: 32px; border-radius: 10px; background-color: ${brand.accentSoft}; color: ${brand.active}; font-family: Arial, Helvetica, sans-serif; font-size: 17px; font-weight: 800; line-height: 32px; text-align: center;">
                !
              </div>
            </td>
            <td valign="top">
              <p style="margin: 0 0 3px; color: ${brand.ink}; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; line-height: 19px;">
          ${escapeHtml(title)}
              </p>
              <p style="margin: 0; color: ${brand.muted}; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px;">
          ${escapeHtml(copy)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const renderEmailLayout = ({ preheader, eyebrow, title, content }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <title>${escapeHtml(title)}</title>
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
        .email-shell {
          width: 100% !important;
          border-radius: 20px !important;
        }

        .email-header,
        .email-content,
        .email-footer {
          padding-left: 24px !important;
          padding-right: 24px !important;
        }

        .email-content {
          padding-top: 32px !important;
          padding-bottom: 32px !important;
        }

        .email-code {
          font-size: 30px !important;
          line-height: 38px !important;
          letter-spacing: 6px !important;
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
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.background}" style="width: 100%; background-color: ${brand.background};">
      <tr>
        <td align="center" style="padding: 44px 16px;">
          <table class="email-shell" role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 620px; overflow: hidden; border: 1px solid ${brand.border}; border-radius: 24px; background-color: ${brand.white}; box-shadow: 0 24px 60px rgba(22, 36, 86, 0.14);">
            <tr>
              <td class="email-header" bgcolor="#f5f9ff" style="padding: 20px 24px; background-color: #f5f9ff; background-image: linear-gradient(135deg, #ffffff 0%, #eef7ff 100%);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td >
                            <img src="cid:devspark-logo" width="125" alt="DevsPark Labs" style="display: block; width: 125px; max-width: 100%; height: auto;" />
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td valign="middle" align="right">
                      <p style="margin: 0; color: ${brand.active}; font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-weight: 700; line-height: 15px; letter-spacing: 1.2px; text-transform: uppercase;">
                        Account security
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td height="4" bgcolor="${brand.accent}" style="height: 4px; background-color: ${brand.accent}; background-image: linear-gradient(90deg, #53eafd 0%, #00b8db 48%, #7c86ff 100%); font-size: 0; line-height: 0;">
                &nbsp;
              </td>
            </tr>

            <tr>
              <td class="email-content" style="padding: 28px;">
                <div style="margin-bottom: 24px;">
                  <p style="margin: 0 0 7px; color: ${brand.active}; font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-weight: 700; line-height: 15px; letter-spacing: 1.5px; text-transform: uppercase;">
                    ${escapeHtml(eyebrow)}
                  </p>
                  <h1 style="margin: 0; color: ${brand.ink}; font-family: Arial, Helvetica, sans-serif; font-size: 29px; font-weight: 500; line-height: 36px; letter-spacing: -0.6px;">
                    ${escapeHtml(title)}
                  </h1>
                </div>
                ${content}
              </td>
            </tr>

            <tr>
              <td class="email-footer" style="border-top: 1px solid ${brand.border}; padding: 28px; background-color: #fafbfe;">
                <p style="margin: 0 0 5px; color: ${brand.ink}; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; line-height: 18px;">
                  DevsPark Labs
                </p>
                <p style="margin: 0; color: ${brand.muted}; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 18px;">
                  Automated security email &nbsp;&bull;&nbsp; <a href="mailto:info@devsparklabs.com" style="color: ${brand.active}; text-decoration: none;">info@devsparklabs.com</a>
                </p>
              </td>
            </tr>
          </table>

          <p style="margin: 20px 0 0; color: #7b87a6; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 17px; text-align: center;">
            &copy; ${new Date().getFullYear()} DevsPark Labs. All rights reserved.
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
};
