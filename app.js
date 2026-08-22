const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// Custom Imports
const AppError = require("./utils/appError");
const globalErrorHandler = require("./utils/globalErrorHandler");

const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};

const app = express();
app.use(cors(corsOptions));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  express.json({
    limit: "3mb",
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES

app.get("/", (req, res) => {
  res.send("DevsParkLabs Website Backend is running...");
});

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
