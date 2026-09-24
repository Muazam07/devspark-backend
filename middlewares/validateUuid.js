const AppError = require("../utils/appError");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

module.exports = (req, res, next, id) => {
  if (!UUID_PATTERN.test(id)) {
    return next(new AppError("Please provide a valid user ID", 400));
  }

  next();
};
