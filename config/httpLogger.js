const crypto = require("crypto");
const pinoHttp = require("pino-http");
const logger = require("./logger");

module.exports = pinoHttp({
  logger,
  genReqId(req, res) {
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();
    res.setHeader("x-request-id", requestId);
    return requestId;
  },
  customLogLevel(req, res, error) {
    if (error || res.statusCode >= 500) return "error";
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
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} completed with ${res.statusCode}`;
  },
  customErrorMessage(req, res) {
    return `${req.method} ${req.url} failed with ${res.statusCode}`;
  },
});
