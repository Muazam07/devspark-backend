const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    FirstName: {
      type: String,
      minlength: 2,
      required: [true, "Please tell us your first name"],
    },
    LastName: {
      type: String,
      minlength: 2,
      required: [true, "Please tell us your last name"],
    },
    Email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Please provide your email"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    Password: {
      type: String,
      minlength: 8,
      required: [true, "Please provide a password"],
      select: false,
    },
    ConfirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      // This only works on CREATE and SAVE!!!
      validate: {
        validator: function (el) {
          return el === this.Password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Password Hashing
userSchema.pre("save", async function (next) {
  // Only hash the password if it is new or has been modified
  if (!this.isModified("Password")) return next();

  // Hash the password with cost of 12
  this.Password = await bcrypt.hash(this.Password, 12);

  // Delete ConfirmPassword field
  this.ConfirmPassword = undefined;
  next();
});

// Password Changed At
userSchema.pre("save", function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("Password") || this.isNew) return next();

  // Subtract 1 second to make sure the token is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
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

const User = mongoose.model("User", userSchema);
module.exports = User;
