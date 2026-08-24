// Custom Imports
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
