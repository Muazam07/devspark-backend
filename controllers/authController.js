const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const sendEmail = require("../mailer");
const EmailVerificationTemplate = require("../templates/emailVerificationTemplate");

const ACCOUNT_VERIFICATION_SUBJECT = "DevsPark Account Verification";
const PASSWORD_RESET_SUBJECT = "DevsPark Password Reset";
const INACTIVE_ACCOUNT_MESSAGE =
  "Your account is inactive. Please contact an administrator.";
const VERIFICATION_CODE_EXPIRES_MS = 10 * 60 * 1000;
const PASSWORD_HASH_ROUNDS = 10;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : email;

const rejectInactiveAccount = (user, next) => {
  if (user.isEmailVerified && !user.status) {
    next(new AppError(INACTIVE_ACCOUNT_MESSAGE, 403));
    return true;
  }

  return false;
};

const validatePassword = (password, confirmPassword, labels = {}) => {
  const passwordLabel = labels.password || "Password";
  const confirmationLabel = labels.confirmation || "confirm password";
  const validationErrors = [];

  if (typeof password !== "string") {
    throw new AppError(`${passwordLabel} is required`, 400);
  }

  if (password.length < 8)
    validationErrors.push(`${passwordLabel} must be at least 8 characters.`);
  if (!/[A-Z]/.test(password))
    validationErrors.push(`${passwordLabel} must contain an uppercase letter.`);
  if (!/[a-z]/.test(password))
    validationErrors.push(`${passwordLabel} must contain a lowercase letter.`);
  if (!/\d/.test(password))
    validationErrors.push(`${passwordLabel} must contain a number.`);
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password))
    validationErrors.push(`${passwordLabel} must contain a special character.`);
  if (password.trim() !== password)
    validationErrors.push(`${passwordLabel} cannot begin or end with spaces.`);

  if (validationErrors.length > 0) {
    throw new AppError(validationErrors.join(" "), 400);
  }

  if (password !== confirmPassword) {
    throw new AppError(
      `${passwordLabel} and ${confirmationLabel} do not match`,
      400
    );
  }
};

const hashPassword = (password) => bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

const createHashedCode = () => {
  const code = crypto.randomInt(100000, 1000000).toString();
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  return { code, hashedCode };
};

const assignEmailVerificationCode = (user) => {
  const { code, hashedCode } = createHashedCode();
  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpires = new Date(
    Date.now() + VERIFICATION_CODE_EXPIRES_MS
  );
  return code;
};

const assignPasswordResetCode = (user) => {
  const { code, hashedCode } = createHashedCode();
  user.passwordResetCode = hashedCode;
  user.passwordResetCodeExpires = new Date(
    Date.now() + VERIFICATION_CODE_EXPIRES_MS
  );
  user.passwordResetVerified = false;
  return code;
};

const changedPasswordAfter = (user, jwtTimestamp) => {
  if (!user.passwordChangedAt) return false;
  return jwtTimestamp < Math.floor(user.passwordChangedAt.getTime() / 1000);
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    token: signToken(user.id),
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  validatePassword(password, confirmPassword);

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: await hashPassword(password),
  });

  const verificationCode = assignEmailVerificationCode(newUser);
  await newUser.save();

  try {
    const htmlContent = EmailVerificationTemplate(newUser, verificationCode);
    await sendEmail(
      newUser.email,
      newUser.firstName,
      ACCOUNT_VERIFICATION_SUBJECT,
      htmlContent
    );
  } catch (error) {
    newUser.emailVerificationCode = null;
    newUser.emailVerificationExpires = null;
    await newUser.save();

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
    data: { user: newUser },
  });
});

exports.verifyCode = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return next(
      new AppError("Please provide email and verification code", 400)
    );
  }

  const user = await User.scope("withVerificationFields").findOne({
    where: { email: normalizeEmail(email) },
  });
  if (!user) return next(new AppError("No account found with that email", 404));
  if (rejectInactiveAccount(user, next)) return;

  const hashedCode = crypto
    .createHash("sha256")
    .update(String(code))
    .digest("hex");

  if (
    user.emailVerificationCode === hashedCode &&
    user.emailVerificationExpires &&
    user.emailVerificationExpires > Date.now()
  ) {
    user.isEmailVerified = true;
    user.status = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully!",
    });
  }

  if (
    user.passwordResetCode === hashedCode &&
    user.passwordResetCodeExpires &&
    user.passwordResetCodeExpires > Date.now()
  ) {
    user.passwordResetVerified = true;
    user.passwordResetCode = null;
    user.passwordResetCodeExpires = null;
    user.passwordResetExpires = new Date(
      Date.now() + VERIFICATION_CODE_EXPIRES_MS
    );
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Code verified successfully!",
    });
  }

  return next(new AppError("Verification code is invalid or has expired", 400));
});

exports.resendVerificationCode = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Please provide email", 400));

  const user = await User.scope("withVerificationFields").findOne({
    where: { email: normalizeEmail(email) },
  });
  if (!user) return next(new AppError("No account found with that email", 404));
  if (rejectInactiveAccount(user, next)) return;
  if (user.isEmailVerified) {
    return next(new AppError("This email is already verified", 400));
  }
  if (
    user.emailVerificationExpires &&
    user.emailVerificationExpires > Date.now()
  ) {
    return next(new AppError("A verification code was already sent", 400));
  }

  const verificationCode = assignEmailVerificationCode(user);
  await user.save();

  try {
    const htmlContent = EmailVerificationTemplate(user, verificationCode);
    await sendEmail(
      user.email,
      user.firstName,
      ACCOUNT_VERIFICATION_SUBJECT,
      htmlContent
    );
  } catch (error) {
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();
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
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.scope("withPassword").findOne({
    where: { email: normalizeEmail(email) },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  if (!user.status) return next(new AppError(INACTIVE_ACCOUNT_MESSAGE, 403));

  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Please provide email", 400));

  const user = await User.scope("withVerificationFields").findOne({
    where: { email: normalizeEmail(email) },
  });
  if (!user) return next(new AppError("No account found with that email", 404));
  if (rejectInactiveAccount(user, next)) return;

  if (user.passwordResetCode && user.passwordResetCodeExpires > Date.now()) {
    return res.status(200).json({
      status: "success",
      message: "Verification code already sent to email!",
    });
  }

  const resetCode = assignPasswordResetCode(user);
  await user.save();

  try {
    const htmlContent = EmailVerificationTemplate(user, resetCode, {
      purpose: "password-reset",
    });
    await sendEmail(
      user.email,
      user.firstName,
      PASSWORD_RESET_SUBJECT,
      htmlContent
    );

    res.status(200).json({
      status: "success",
      message: "Verification code sent to email!",
    });
  } catch (error) {
    user.passwordResetCode = null;
    user.passwordResetCodeExpires = null;
    await user.save();
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
  if (!email || !password || !confirmPassword) {
    return next(
      new AppError("Please provide email, password and confirm password", 400)
    );
  }
  validatePassword(password, confirmPassword);

  const user = await User.scope("withVerificationFields").findOne({
    where: { email: normalizeEmail(email) },
  });
  if (!user) return next(new AppError("No account found with that email", 404));
  if (rejectInactiveAccount(user, next)) return;
  if (
    !user.passwordResetVerified ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < Date.now()
  ) {
    return next(
      new AppError("Please verify your code before resetting the password", 400)
    );
  }

  user.password = await hashPassword(password);
  user.passwordChangedAt = new Date(Date.now() - 1000);
  user.passwordResetVerified = false;
  user.passwordResetExpires = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };

exports.protect = catchAsync(async (req, res, next) => {
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

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.scope("withPassword").findByPk(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }
  if (changedPasswordAfter(freshUser, decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  if (!freshUser.status) {
    return next(new AppError(INACTIVE_ACCOUNT_MESSAGE, 403));
  }

  req.user = freshUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newConfirmPassword } = req.body;
  if (!currentPassword || !newPassword || !newConfirmPassword) {
    return next(
      new AppError(
        "Please provide your current password, new password and confirm password",
        400
      )
    );
  }

  const user = await User.scope("withPassword").findByPk(req.user.id);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError("Current password is incorrect", 401));
  }
  validatePassword(newPassword, newConfirmPassword, {
    password: "New password",
    confirmation: "confirm password",
  });

  user.password = await hashPassword(newPassword);
  user.passwordChangedAt = new Date(Date.now() - 1000);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});
