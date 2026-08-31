const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
// Custom Imports
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const sendEmail = require("../mailer");
const EmailVerificationTemplate = require("../templates/emailVerificationTemplate");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Sensitive/internal fields are stripped by the User schema's toJSON transform
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
    const subject = "Your DevsPark Labs verification code";
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

  res.status(201).json({
    status: "success",
    message: "Verification code sent to email!",
    data: {
      user: newUser,
    },
  });
});

// Handles both signup email verification and forgot-password OTP verification
exports.verifyCode = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  // 1) Check if email and code are provided
  if (!email || !code) {
    return next(
      new AppError("Please provide email and verification code", 400)
    );
  }

  // 2) Check if a user exists with that email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No account found with that email", 404));
  }

  const hashedCode = crypto
    .createHash("sha256")
    .update(String(code))
    .digest("hex");

  // 3) Try matching a signup email-verification code first
  if (
    user.emailVerificationCode === hashedCode &&
    user.emailVerificationExpires &&
    user.emailVerificationExpires > Date.now()
  ) {
    user.isEmailVerified = true;
    user.status = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully!",
    });
  }

  // 4) Otherwise, try matching a forgot-password OTP
  if (
    user.passwordResetCode === hashedCode &&
    user.passwordResetCodeExpires &&
    user.passwordResetCodeExpires > Date.now()
  ) {
    user.passwordResetVerified = true;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: "success",
      message: "Code verified successfully!",
    });
  }

  // 5) Neither code matched
  return next(new AppError("Verification code is invalid or has expired", 400));
});

exports.resendVerificationCode = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // 1) Check if email is provided
  if (!email) {
    return next(new AppError("Please provide email", 400));
  }

  // 2) Check if a user exists with that email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No account found with that email", 404));
  }

  // 3) Already verified users don't need a new code
  if (user.status) {
    return next(new AppError("This email is already verified", 400));
  }

  // 4) Only issue a new code once the previous one has expired
  if (
    user.emailVerificationExpires &&
    user.emailVerificationExpires > Date.now()
  ) {
    return next(new AppError("A verification code was already sent", 400));
  }

  // 5) Generate and send a new verification code
  const verificationCode = user.createEmailVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    const subject = "Your DevsPark Labs verification code";
    const htmlContent = EmailVerificationTemplate(user, verificationCode);

    await sendEmail(user.email, user.firstName, subject, htmlContent);
  } catch (error) {
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the verification email. Try again later!",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Verification code sent to email!",
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
    return next(new AppError("No account found with that email", 404));
  }

  // 3) If a previously sent code hasn't expired yet, don't generate a new one
  if (user.passwordResetCode && user.passwordResetCodeExpires > Date.now()) {
    return res.status(200).json({
      status: "success",
      message: "Verification code already sent to email!",
    });
  }

  // 4) Generate and send a 6-digit OTP
  const resetCode = user.createPasswordResetCode();
  user.passwordResetVerified = undefined;
  await user.save({ validateBeforeSave: false });

  try {
    const subject = "Your password reset code (valid for 10 min)";
    const htmlContent = EmailVerificationTemplate(user, resetCode, {
      purpose: "password-reset",
    });

    await sendEmail(user.email, user.firstName, subject, htmlContent);

    res.status(200).json({
      status: "success",
      message: "Verification code sent to email!",
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
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
  const { email, password, confirmPassword } = req.body;

  // 1) Check if email, password and confirm password are provided
  if (!email || !password || !confirmPassword) {
    return next(
      new AppError("Please provide email, password and confirm password", 400)
    );
  }

  // 2) Check password and confirm password match
  if (password !== confirmPassword) {
    return next(
      new AppError("Password and confirm password do not match", 400)
    );
  }

  // 3) Check if a user exists with that email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No account found with that email", 404));
  }

  // 4) Check the code was verified and the window hasn't expired
  if (
    !user.passwordResetVerified ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < Date.now()
  ) {
    return next(
      new AppError("Please verify your code before resetting the password", 400)
    );
  }

  // 4) Update the password
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetVerified = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newConfirmPassword } = req.body;

  // 1) Check if current password, new password and confirm password are provided
  if (!currentPassword || !newPassword || !newConfirmPassword) {
    return next(
      new AppError(
        "Please provide your current password, new password and confirm password",
        400
      )
    );
  }

  // 2) Check if user exists && current password is correct
  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // 3) Check new password and confirm password match
  if (newPassword !== newConfirmPassword) {
    return next(
      new AppError("New password and confirm password do not match", 400)
    );
  }

  // 4) If everything ok, update password
  user.password = newPassword;
  user.confirmPassword = newConfirmPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
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

  // 5) Check if the account is active
  if (!freshUser.status) {
    return next(
      new AppError("Your account is not active. Please contact support.", 403)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});
