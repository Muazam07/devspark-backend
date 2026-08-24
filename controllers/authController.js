const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
// Custom Imports
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const sendEmail = require("../mailer");
const ResetPasswordTemplate = require("../templates/resetPasswordTemplate");
const EmailVerificationTemplate = require("../templates/emailVerificationTemplate");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove sensitive fields from output
  user.password = undefined;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  // Generate and send the email verification code
  const verificationCode = newUser.createEmailVerificationCode();
  await newUser.save({ validateBeforeSave: false });

  try {
    const subject = "Verify your email (code valid for 1 min)";
    const htmlContent = EmailVerificationTemplate(newUser, verificationCode);

    await sendEmail(newUser.email, newUser.firstName, subject, htmlContent);
  } catch (error) {
    newUser.emailVerificationCode = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the verification email. Try again later!",
        500
      )
    );
  }

  createSendToken(newUser, 201, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  // 1) Check if email and code are provided
  if (!email || !code) {
    return next(
      new AppError("Please provide email and verification code", 400)
    );
  }

  // 2) Find user by email + hashed code, and check it hasn't expired
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  const user = await User.findOne({
    email,
    emailVerificationCode: hashedCode,
    emailVerificationExpires: { $gt: Date.now() }, // greater than
  });

  // 3) If code is invalid or has expired
  if (!user) {
    return next(
      new AppError("Verification code is invalid or has expired", 400)
    );
  }

  // 4) Mark email as verified and activate the account
  user.isEmailVerified = true;
  user.status = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully!",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Check if email exists
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide email", 400));
  }

  // 2) Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // 3) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 4) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${resetToken}`;

  try {
    const subject = "Your password reset token (valid for 10 min)";
    const htmlContent = ResetPasswordTemplate(user, resetURL);

    await sendEmail(user.email, user.firstName, subject, htmlContent);

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // greater than
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // 3) Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined; // delete token
  user.passwordResetExpires = undefined; // delete token
  await user.save();

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newConfirmPassword } = req.body;

  // 1) Check if current and new password are provided
  if (!currentPassword || !newPassword || !newConfirmPassword) {
    return next(
      new AppError("Please provide your current password and new password", 400)
    );
  }

  // 2) Check if user exists && current password is correct
  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Incorrect password", 401));
  }

  // 3) If everything ok, update password
  user.password = newPassword;
  user.confirmPassword = newConfirmPassword;
  await user.save();

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshUser = await User.findById(decode.id);
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (freshUser.changePasswordAfter(decode.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});
