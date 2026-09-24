const path = require("path");

const projectRoot = path.join(__dirname, "..");
const ignoredFile = path.join(__dirname, "catchAsync.js");

const getMessage = (error) => {
  if (!error.errors?.length) return error.message;

  return [...new Set(error.errors.map((item) => item.message))].join(". ");
};

const getLocation = (error) => {
  const frame = error.stack
    ?.split("\n")
    .map((line) => line.trim())
    .find(
      (line) =>
        line.startsWith("at ") &&
        line.includes(projectRoot) &&
        !line.includes("node_modules") &&
        !line.includes(ignoredFile)
    );
  const match = frame?.match(/(\/.+?):(\d+):\d+\)?$/);

  return match
    ? `${path.relative(projectRoot, match[1])}:${match[2]}`
    : undefined;
};

const getType = (error) =>
  error.name && error.name !== "Error" ? error.name : error.constructor.name;

const getCode = (error) =>
  error.original?.code || error.parent?.code || error.code;

const getDatabaseOperation = (error) => {
  const sql = error.sql || error.parent?.sql;
  if (!sql) return undefined;

  const operation = sql.trim().split(/\s+/)[0].toUpperCase();
  const table =
    error.table || sql.match(/(?:INTO|UPDATE|FROM)\s+"?(\w+)"?/i)?.[1];

  return table ? `${operation} ${table}` : operation;
};

module.exports = (error, fallbackLocation) => ({
  message: getMessage(error),
  type: getType(error),
  code: getCode(error),
  database: getDatabaseOperation(error),
  location: getLocation(error) || fallbackLocation,
});
