const { Op } = require("sequelize");
const AppError = require("../utils/appError");
const UserEnum = require("../enums/userEnum");

const USER_ROLES = [UserEnum.USER, UserEnum.ADMIN];

const escapeLikePattern = (value) => value.replace(/[\\%_]/g, "\\$&");

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

const parseRoleFilter = (value) => {
  if (value === undefined || value === "") return undefined;

  if (typeof value === "string") {
    const normalizedRole = value.trim().toLowerCase();
    if (USER_ROLES.includes(normalizedRole)) return normalizedRole;
  }

  throw new AppError("Role must be either user or admin", 400);
};

const userFilters = ({ search, role, emailVerified, status }) => {
  const where = {};

  if (search !== undefined && typeof search !== "string") {
    throw new AppError("Search must be text", 400);
  }

  const normalizedSearch = search?.trim() || "";
  if (normalizedSearch.length > 0 && normalizedSearch.length < 3) {
    throw new AppError("Search must contain at least 3 characters", 400);
  }

  const searchTerms = normalizedSearch.split(/\s+/).filter(Boolean);
  if (searchTerms.length > 0) {
    where[Op.and] = searchTerms.map((term) => {
      const pattern = `%${escapeLikePattern(term)}%`;

      return {
        [Op.or]: [
          { firstName: { [Op.iLike]: pattern } },
          { lastName: { [Op.iLike]: pattern } },
        ],
      };
    });
  }

  const userRole = parseRoleFilter(role);
  const isEmailVerified = parseBooleanFilter(emailVerified, "Email verified");
  const userStatus = parseBooleanFilter(status, "Status");

  if (userRole !== undefined) where.role = userRole;
  if (isEmailVerified !== undefined) where.isEmailVerified = isEmailVerified;
  if (userStatus !== undefined) where.status = userStatus;

  return where;
};

module.exports = userFilters;
