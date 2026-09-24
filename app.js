const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const { sequelize } = require("./config/database");
const httpLogger = require("./config/httpLogger");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./utils/globalErrorHandler");
const { apiLimiter } = require("./middlewares/rateLimiters");
const userRouter = require("./routes/userRoutes");

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(new AppError("This origin is not allowed", 403));
  },
};

const app = express();

if (process.env.TRUST_PROXY) {
  const trustProxy = /^\d+$/.test(process.env.TRUST_PROXY)
    ? Number(process.env.TRUST_PROXY)
    : process.env.TRUST_PROXY;
  app.set("trust proxy", trustProxy);
}

app.use(httpLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

app.get("/", (req, res) => {
  res.send("DevsParkLabs Website Backend is running...");
});

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: "success",
      services: { database: "connected" },
    });
  } catch (error) {
    req.log.error({ err: error }, "Database health check failed");
    res.status(503).json({
      status: "error",
      message: "The service is temporarily unavailable.",
      requestId: req.id,
    });
  }
});

app.use("/api", apiLimiter);
app.use("/api/v1/users", userRouter);

app.use((req, res, next) => {
  next(new AppError("The requested resource was not found", 404));
});

app.use(globalErrorHandler);

module.exports = app;
