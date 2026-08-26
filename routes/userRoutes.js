const express = require("express");
// Custom Imports
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

// AUTH ROUTES
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/verifyCode", authController.verifyCode);
router.post("/resetPassword", authController.resetPassword);

// PROTECTED ROUTES
router.use(authController.protect);

router.get("/me", userController.getMe);
router.put("/updateMe", userController.updateMe);
router.post(
  "/requestPasswordUpdateCode",
  authController.requestPasswordUpdateCode
);
router.patch("/updateMyPassword", authController.updatePassword);
router.delete("/deleteMe", userController.deleteMe);

module.exports = router;
