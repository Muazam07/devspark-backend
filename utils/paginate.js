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
  model,
  where,
  order,
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

  const { rows: documents, count: totalResults } = await model.findAndCountAll({
    where,
    order,
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

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
