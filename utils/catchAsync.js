const path = require("path");
const requestContext = require("../config/requestContext");

const projectRoot = path.join(__dirname, "..");

const CALL_SITE_REGEX = /^at (?:.*? \()?(.+?):(\d+):\d+\)?$/;

const getCallSite = () => {
  const frame = new Error().stack.split("\n")[3] || "";
  const match = frame.trim().match(CALL_SITE_REGEX);
  return match ? { file: match[1], line: Number(match[2]) } : null;
};

const toRelativeLocation = (callSite) =>
  callSite
    ? `${path.relative(projectRoot, callSite.file)}:${callSite.line}`
    : undefined;

const resolveHandlerName = (handler, callSite) => {
  if (!callSite) return "anonymous";

  const moduleName = path.basename(callSite.file, ".js");
  const moduleExports = require.cache[callSite.file]?.exports || {};
  const exportName = Object.keys(moduleExports).find(
    (key) => moduleExports[key] === handler
  );

  return exportName
    ? `${moduleName}.${exportName}`
    : `${moduleName}:${callSite.line}`;
};

module.exports = (fn) => {
  const callSite = getCallSite();
  const handlerLocation = toRelativeLocation(callSite);
  let handlerName;

  const handler = (req, res, next) => {
    handlerName ??= resolveHandlerName(handler, callSite);
    requestContext.setHandler(handlerName, handlerLocation);
    fn(req, res, next).catch(next);
  };

  return handler;
};
