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

module.exports = (error, fallbackLocation) => ({
  message: getMessage(error),
  location: getLocation(error) || fallbackLocation,
});
