const pino = require("pino");
const path = require("path");

const isDevelopment = process.env.NODE_ENV !== "production";

const transport = isDevelopment
  ? {
      target: path.join(__dirname, "prettyTransport.js"),
    }
  : undefined;

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport,
  redact: {
    paths: [
      "password",
      "confirmPassword",
      "currentPassword",
      "newPassword",
      "newConfirmPassword",
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.confirmPassword",
      "req.body.currentPassword",
      "req.body.newPassword",
      "req.body.newConfirmPassword",
      "res.headers.set-cookie",
    ],
    censor: "[REDACTED]",
  },
});

module.exports = logger;
