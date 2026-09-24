const pino = require("pino");

const isDevelopment = process.env.NODE_ENV !== "production";

const transport =
  isDevelopment && process.stdout.isTTY
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
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
