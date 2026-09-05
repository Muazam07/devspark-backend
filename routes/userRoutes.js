const express = require("express");
// Custom Imports
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

// AUTH ROUTES
router.post("/signup", authController.signup);
router.post("/verify-code", authController.verifyCode);
router.post("/resend-verification-code", authController.resendVerificationCode);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// PROTECTED ROUTES
router.use(authController.protect);

router.get("/", userController.getAllUsers);
router.put("/update-user", userController.updateUser);
router.patch("/update-password", authController.updatePassword);
router.patch("/:id/status", userController.updateUserStatus);
router.get("/:id", userController.getUser);

module.exports = router;
