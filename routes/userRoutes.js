const express = require("express");
// Custom Imports
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const UserRole = require("../enums/userEnum");
const { authLimiter } = require("../middlewares/rateLimiters");
const validateUuid = require("../middlewares/validateUuid");

const router = express.Router();
router.param("id", validateUuid);

// AUTH ROUTES
router.post("/signup", authLimiter, authController.signup);
router.post("/verify-code", authLimiter, authController.verifyCode);
router.post(
  "/resend-verification-code",
  authLimiter,
  authController.resendVerificationCode
);
router.post("/login", authLimiter, authController.login);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

// PROTECTED ROUTES
router.use(authController.protect);

router.get("/", userController.getAllUsers);
router.put("/update-user", userController.updateUser);
router.patch("/update-password", authController.updatePassword);
// todo: For Admin Only
router.patch(
  "/:id/status",
  authController.restrictTo(UserRole.ADMIN),
  userController.updateUserStatus
);
// todo: For Admin Only
router.get("/:id", userController.getUser);

module.exports = router;
