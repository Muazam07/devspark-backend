const crypto = require("crypto");
const pinoHttp = require("pino-http");
const logger = require("./logger");

module.exports = pinoHttp({
  logger,
  customAttributeKeys: { reqId: "requestId" },
  genReqId(req, res) {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    res.setHeader("x-request-id", requestId);
    return requestId;
  },
  customLogLevel(req, res) {
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
  customSuccessMessage(req, res, responseTime) {
    return `HTTP ${req.method} ${req.url} → ${res.statusCode} (${responseTime} ms)`;
  },
  customErrorMessage(req, res, error, responseTime) {
    return `HTTP ${req.method} ${req.url} → ${res.statusCode} (${responseTime} ms)`;
  },
  customProps(req, res) {
    return {
      ...(req.user?.id && { userId: req.user.id }),
      ...(res.locals?.context?.email && { email: res.locals.context.email }),
      ...(res.locals?.error && { error: res.locals.error }),
    };
  },
});
