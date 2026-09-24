const {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} = require("sequelize");
const AppError = require("./appError");
const logger = require("../config/logger");

const handleUniqueConstraintError = (error) => {
  const field = error.errors?.[0]?.path || "Value";
  const label = field.charAt(0).toUpperCase() + field.slice(1);
  return new AppError(`${label} is already in use.`, 409);
};

const handleValidationError = (error) => {
  const messages = [...new Set(error.errors.map((item) => item.message))];
  return new AppError(`Invalid input data. ${messages.join(". ")}`, 400);
};

const normalizeError = (error) => {
  if (error instanceof UniqueConstraintError) {
    return handleUniqueConstraintError(error);
  }
  if (error instanceof ValidationError) return handleValidationError(error);
  if (error instanceof ForeignKeyConstraintError) {
    return new AppError("The related resource does not exist.", 400);
  }
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    Object.prototype.hasOwnProperty.call(error, "body")
  ) {
    return new AppError("The request body contains invalid JSON.", 400);
  }
  if (error.type === "entity.too.large") {
    return new AppError("The request body is too large.", 413);
  }
  if (error.name === "JsonWebTokenError") {
    return new AppError("Invalid token. Please log in again!", 401);
  }
  if (error.name === "TokenExpiredError") {
    return new AppError("Your token has expired. Please log in again.", 401);
  }

  return error;
};

module.exports = (error, req, res, next) => {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode || 500;
  const status = normalizedError.status || "error";

  if (!normalizedError.isOperational) {
    (req.log || logger).error(
      { err: error, requestId: req.id },
      "Unhandled request error"
    );
  }

  res.status(statusCode).json({
    status,
    message: normalizedError.isOperational
      ? normalizedError.message
      : "Something went wrong. Please try again later.",
    requestId: req.id,
  });
};
