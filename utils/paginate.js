const AppError = require("./appError");

const parsePositiveInteger = (value, fallback, fieldName) => {
  if (value === undefined) return fallback;

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(`${fieldName} must be a positive whole number`, 400);
  }

  return parsedValue;
};

const paginate = async (
  model,
  queryParams = {},
  {
    filter = {},
    sort = { createdAt: -1, _id: -1 },
    defaultLimit = 10,
    maxLimit = 100,
    totalKey = "totalResults",
  } = {}
) => {
  const page = parsePositiveInteger(queryParams.page, 1, "Page");
  const limit = parsePositiveInteger(queryParams.limit, defaultLimit, "Limit");

  if (limit > maxLimit) {
    throw new AppError(`Limit cannot be greater than ${maxLimit}`, 400);
  }

  const skip = (page - 1) * limit;
  const [documents, totalResults] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit),
    model.countDocuments(filter),
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
