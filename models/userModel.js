const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const UserRole = require("../enums/userEnum");

const EMAIL_VERIFICATION_CODE_EXPIRES_MS = 10 * 60 * 1000;
const PASSWORD_RESET_CODE_EXPIRES_MS = 10 * 60 * 1000;

const hiddenAttributes = [
  "password",
  "confirmPassword",
  "passwordChangedAt",
  "emailVerificationCode",
  "emailVerificationExpires",
  "passwordResetToken",
  "passwordResetExpires",
  "passwordResetCode",
  "passwordResetCodeExpires",
  "passwordResetVerified",
];

class User extends Model {
  async correctPassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  changePasswordAfter(jwtTimestamp) {
    if (!this.passwordChangedAt) return false;

    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return jwtTimestamp < changedTimestamp;
  }

  createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }

  createEmailVerificationCode() {
    const code = crypto.randomInt(100000, 1000000).toString();

    this.emailVerificationCode = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");
    this.emailVerificationExpires = new Date(
      Date.now() + EMAIL_VERIFICATION_CODE_EXPIRES_MS
    );

    return code;
  }

  createPasswordResetCode() {
    const code = crypto.randomInt(100000, 1000000).toString();

    this.passwordResetCode = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");
    this.passwordResetCodeExpires = new Date(
      Date.now() + PASSWORD_RESET_CODE_EXPIRES_MS
    );
    this.passwordResetVerified = false;

    return code;
  }

  toJSON() {
    const values = { ...this.get() };

    for (const attribute of hiddenAttributes) {
      delete values[attribute];
    }
    delete values.createdAt;
    delete values.updatedAt;

    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Please tell us your first name" },
        notEmpty: { msg: "Please tell us your first name" },
        len: { args: [2, 100], msg: "First name must contain 2 characters" },
      },
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "Please tell us your last name" },
        notEmpty: { msg: "Please tell us your last name" },
        len: { args: [2, 100], msg: "Last name must contain 2 characters" },
      },
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("email", value?.trim().toLowerCase());
      },
      validate: {
        notNull: { msg: "Please provide your email" },
        notEmpty: { msg: "Please provide your email" },
        isEmail: { msg: "Please provide a valid email" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Please provide a password" },
        len: {
          args: [8, 255],
          msg: "Password must contain at least 8 characters",
        },
      },
    },
    confirmPassword: {
      type: DataTypes.VIRTUAL,
      validate: {
        matchesPassword(value) {
          if (this.changed("password") && value !== this.password) {
            throw new Error("Passwords are not the same!");
          }
        },
      },
    },
    passwordChangedAt: DataTypes.DATE,
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailVerificationCode: DataTypes.STRING(64),
    emailVerificationExpires: DataTypes.DATE,
    passwordResetToken: DataTypes.STRING(64),
    passwordResetExpires: DataTypes.DATE,
    passwordResetCode: DataTypes.STRING(64),
    passwordResetCodeExpires: DataTypes.DATE,
    passwordResetVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    defaultScope: {
      attributes: { exclude: hiddenAttributes },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password", "passwordChangedAt"] },
      },
      withVerificationFields: {
        attributes: { include: hiddenAttributes },
      },
    },
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["role"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
    ],
    hooks: {
      async beforeSave(user) {
        if (!user.changed("password")) return;

        user.password = await bcrypt.hash(user.password, 12);
        if (!user.isNewRecord) {
          user.passwordChangedAt = new Date(Date.now() - 1000);
        }
      },
    },
  }
);

module.exports = User;
