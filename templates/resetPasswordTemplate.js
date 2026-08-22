const ResetPasswordTemplate = (user, url) => `
<!DOCTYPE html>
<html>
   <head>
   </head>
   <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
         <h2 style="color: #3498db;">Hello ${user.FirstName},</h2>
         <p style="margin-bottom: 20px; font-size: 16px;">You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the link below to reset your password:</p>
         <div style="font-size: 14px;"><strong style="font-size: 16px;"><a href="${url}">Reset password</a></strong></div>
         <p style="margin-bottom: 20px; font-size: 16px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
   </body>
</html>
`;

module.exports = ResetPasswordTemplate;
