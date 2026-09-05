const AppError = require("../utils/appError");

const escapeRegExp = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseBooleanFilter = (value, fieldName) => {
  if (value === undefined || value === "") return undefined;

  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalizedValue = value.toLowerCase();

    if (normalizedValue === "true") return true;
    if (normalizedValue === "false") return false;
  }

  throw new AppError(`${fieldName} must be either true or false`, 400);
};

const userFilters = ({ search, emailVerified, status }) => {
  const filter = {};

  if (search !== undefined && typeof search !== "string") {
    throw new AppError("Search must be text", 400);
  }

  const searchTerms = search?.trim().split(/\s+/).filter(Boolean) || [];

  if (searchTerms.length > 0) {
    filter.$and = searchTerms.map((term) => {
      const namePattern = new RegExp(escapeRegExp(term), "i");

      return {
        $or: [{ firstName: namePattern }, { lastName: namePattern }],
      };
    });
  }

  const isEmailVerified = parseBooleanFilter(emailVerified, "Email verified");
  const userStatus = parseBooleanFilter(status, "Status");

  if (isEmailVerified !== undefined) {
    filter.isEmailVerified = isEmailVerified;
  }

  if (userStatus !== undefined) {
    filter.status = userStatus;
  }

  return filter;
};

module.exports = userFilters;
