// Custom Imports
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ id: req.params.id });

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, email },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError("No user found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (typeof status !== "boolean") {
    return next(new AppError("Please provide a valid status", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { status },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: status
      ? "User has been activated successfully."
      : "User has been deactivated successfully.",
    data: {
      user: updatedUser,
    },
  });
});
