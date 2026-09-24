const { rateLimit } = require("express-rate-limit");

const createRateLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      status: "fail",
      message,
    },
  });

const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT) || 300,
  message: "Too many requests. Please try again later.",
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  message: "Too many authentication attempts. Please try again later.",
});

module.exports = { apiLimiter, authLimiter };
