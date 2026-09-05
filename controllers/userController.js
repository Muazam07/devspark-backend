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

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (!Number.isInteger(page) || page < 1) {
    return next(new AppError("Page must be a positive whole number", 400));
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return next(
      new AppError("Limit must be a whole number between 1 and 100", 400)
    );
  }

  const skip = (page - 1) * limit;
  const [users, totalUsers] = await Promise.all([
    User.find().sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    },
    data: {
      users,
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
