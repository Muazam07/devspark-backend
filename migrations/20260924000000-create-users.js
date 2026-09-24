"use strict";

const UserRole = require("../enums/userEnum");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      firstName: {
        field: "first_name",
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lastName: {
        field: "last_name",
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(320),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      passwordChangedAt: {
        field: "password_changed_at",
        type: Sequelize.DATE,
      },
      role: {
        type: Sequelize.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.USER,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isEmailVerified: {
        field: "is_email_verified",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emailVerificationCode: {
        field: "email_verification_code",
        type: Sequelize.STRING(64),
      },
      emailVerificationExpires: {
        field: "email_verification_expires",
        type: Sequelize.DATE,
      },
      passwordResetToken: {
        field: "password_reset_token",
        type: Sequelize.STRING(64),
      },
      passwordResetExpires: {
        field: "password_reset_expires",
        type: Sequelize.DATE,
      },
      passwordResetCode: {
        field: "password_reset_code",
        type: Sequelize.STRING(64),
      },
      passwordResetCodeExpires: {
        field: "password_reset_code_expires",
        type: Sequelize.DATE,
      },
      passwordResetVerified: {
        field: "password_reset_verified",
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        field: "created_at",
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        field: "updated_at",
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("users", ["role"]);
    await queryInterface.addIndex("users", ["status"]);
    await queryInterface.addIndex("users", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_role";'
    );
  },
};
