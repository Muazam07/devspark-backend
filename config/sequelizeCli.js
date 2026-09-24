require("dotenv").config({ quiet: true });

const useSsl = process.env.DB_SSL === "true";

const createConfig = (databaseName) => ({
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: databaseName,
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        },
      }
    : {},
});

const createUrlConfig = () => ({
  use_env_variable: "DATABASE_URL",
  dialect: "postgres",
  dialectOptions: createConfig().dialectOptions,
});

module.exports = {
  development: process.env.DATABASE_URL
    ? createUrlConfig()
    : createConfig(process.env.DB_NAME || "devspark_backend"),
  test: createConfig(process.env.DB_TEST_NAME || "devspark_backend_test"),
  production: process.env.DATABASE_URL
    ? createUrlConfig()
    : createConfig(process.env.DB_NAME || "devspark_backend"),
};
