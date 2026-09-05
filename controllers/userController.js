// Custom Imports
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const userFilters = require("../filters/userFilters");
const paginate = require("../utils/paginate");
const User = require("../models/userModel");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const filter = userFilters(req.query);
  const usersQuery = User.find(filter).sort({ createdAt: -1, _id: -1 });
  const countQuery = User.countDocuments(filter);
  const { documents: users, pagination } = await paginate({
    query: usersQuery,
    countQuery,
    page: req.query.page,
    limit: req.query.limit,
    totalKey: "totalUsers",
  });

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination,
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

  const user = await User.findOne({ id: req.params.id });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.isEmailVerified) {
    return next(
      new AppError("Only verified users can have their status updated", 400)
    );
  }

  user.status = status;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: status
      ? "User has been activated successfully."
      : "User has been deactivated successfully.",
    data: {
      user,
    },
  });
});

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
