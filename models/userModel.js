const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const UserRole = require("../enums/userEnum");

const hiddenAttributes = [
  "password",
  "passwordChangedAt",
  "emailVerificationCode",
  "emailVerificationExpires",
  "passwordResetToken",
  "passwordResetExpires",
  "passwordResetCode",
  "passwordResetCodeExpires",
  "passwordResetVerified",
];

const User = sequelize.define(
  "User",
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
  }
);

User.prototype.toJSON = function () {
  const values = { ...this.get() };

  for (const attribute of hiddenAttributes) {
    delete values[attribute];
  }
  delete values.createdAt;
  delete values.updatedAt;

  return values;
};

module.exports = User;
