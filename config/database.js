const { Sequelize } = require("sequelize");
const logger = require("./logger");

const useSsl = process.env.DB_SSL === "true";

const commonOptions = {
  dialect: "postgres",
  logging:
    process.env.DB_LOGGING === "true"
      ? (message) => logger.debug({ sql: message }, "Database query")
      : false,
  define: {
    underscored: true,
    timestamps: true,
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX) || 10,
    min: Number(process.env.DB_POOL_MIN) || 0,
    acquire: Number(process.env.DB_POOL_ACQUIRE_MS) || 30000,
    idle: Number(process.env.DB_POOL_IDLE_MS) || 10000,
  },
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        },
      }
    : {},
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
      process.env.DB_NAME || "devspark_backend",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "",
      {
        ...commonOptions,
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 5432,
      }
    );

const connectDatabase = async () => {
  await sequelize.authenticate();
  logger.info(
    {
      database: sequelize.getDatabaseName(),
      host: sequelize.config.host,
      environment: process.env.NODE_ENV || "development",
    },
    "PostgreSQL connection established"
  );
};

const closeDatabase = async () => {
  await sequelize.close();
  logger.info("PostgreSQL connection closed");
};

module.exports = { sequelize, connectDatabase, closeDatabase };
