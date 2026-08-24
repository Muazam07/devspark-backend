const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// TESTING: 1 minute. Change to 10 * 60 * 1000 (10 minutes) later.
const EMAIL_VERIFICATION_CODE_EXPIRES_MS = 60 * 1000;

const userSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.UUID, // stored as BSON Binary subtype 4
      default: () => crypto.randomUUID(),
      unique: true,
    },
    firstName: {
      type: String,
      minlength: 2,
      required: [true, "Please tell us your first name"],
    },
    lastName: {
      type: String,
      minlength: 2,
      required: [true, "Please tell us your last name"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Please provide your email"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      minlength: 8,
      required: [true, "Please provide a password"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      // This only works on CREATE and SAVE!!!
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Password Hashing
userSchema.pre("save", async function () {
  // Only hash the password if it is new or has been modified
  if (!this.isModified("password")) return;

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirmPassword field
  this.confirmPassword = undefined;
});

// Password Changed At
userSchema.pre("save", function () {
  // Only run this function if password was actually modified
  if (!this.isModified("password") || this.isNew) return;

  // Subtract 1 second to make sure the token is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
});

// Instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Change password after reset
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10 // base 10
    );
    return JWTTimestamp < changedTimestamp; // 100 < 200
  }

  // False means NOT changed
  return false;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function () {
  // create random string
  const resetToken = crypto.randomBytes(32).toString("hex");

  // encrypt the token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set the token expire time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // return the unencrypted token
  return resetToken;
};

// Create email verification code
userSchema.methods.createEmailVerificationCode = function () {
  // generate 6-digit code
  const code = crypto.randomInt(100000, 1000000).toString();

  // encrypt the code
  this.emailVerificationCode = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  // set the code expire time
  this.emailVerificationExpires =
    Date.now() + EMAIL_VERIFICATION_CODE_EXPIRES_MS;

  // return the unencrypted code
  return code;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
