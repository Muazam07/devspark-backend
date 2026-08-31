const express = require("express");
// Custom Imports
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

// AUTH ROUTES
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

router.post("/verify-code", authController.verifyCode);

// PROTECTED ROUTES
router.use(authController.protect);

router.get("/:id", userController.getUser);
router.put("/update-user", userController.updateUser);
router.patch("/update-password", authController.updatePassword);
router.patch("/update-user-status", userController.updateUserStatus);

module.exports = router;
