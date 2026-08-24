const express = require("express");
// Custom Imports
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

// AUTH ROUTES
router.post("/signup", authController.signup);
router.post("/verifyEmail", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// PROTECTED ROUTES
router.use(authController.protect);

router.get("/me", userController.getMe);
router.put("/updateMe", userController.updateMe);
router.patch("/updateMyPassword", authController.updatePassword);
router.delete("/deleteMe", userController.deleteMe);

module.exports = router;
