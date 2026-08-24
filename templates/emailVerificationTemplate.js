const EmailVerificationTemplate = (user, code) => `
<!DOCTYPE html>
<html>
   <head>
   </head>
   <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
         <h2 style="color: #3498db;">Hello ${user.firstName},</h2>
         <p style="margin-bottom: 20px; font-size: 16px;">Use the verification code below to confirm your email address:</p>
         <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin-bottom: 20px;">${code}</div>
         <p style="margin-bottom: 20px; font-size: 16px;">This code will expire shortly. If you did not create an account, please ignore this email.</p>
      </div>
   </body>
</html>
`;

module.exports = EmailVerificationTemplate;
