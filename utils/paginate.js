const AppError = require("./appError");

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined) return fallback;

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(`${fieldName} must be a positive whole number`, 400);
  }

  return parsedValue;
};

const paginate = async ({
  query,
  countQuery,
  page: pageValue,
  limit: limitValue,
  defaultLimit = 10,
  maxLimit = 100,
  totalKey = "totalResults",
}) => {
  const page = parsePositiveInteger(pageValue, 1, "Page");
  const limit = parsePositiveInteger(limitValue, defaultLimit, "Limit");

  if (limit > maxLimit) {
    throw new AppError(`Limit cannot be greater than ${maxLimit}`, 400);
  }

  const skip = (page - 1) * limit;
  const [documents, totalResults] = await Promise.all([
    query.skip(skip).limit(limit),
    countQuery,
  ]);

  return {
    documents,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      [totalKey]: totalResults,
    },
  };
};

module.exports = paginate;
