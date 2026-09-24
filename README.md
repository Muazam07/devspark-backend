# DevsPark Backend

Node.js and Express API backed by PostgreSQL through Sequelize. The project uses
CommonJS modules, Sequelize-managed schema synchronization, UUID primary keys,
structured Pino logging, JWT authentication, and transactional email
verification.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- PostgreSQL 13 or newer

## Local PostgreSQL setup with pgAdmin 4

1. Start your PostgreSQL server, then open pgAdmin and connect to it.
2. Right-click **Databases**, choose **Create > Database**, and use
   `devspark_backend` as the database name.
3. Copy `.env.example` to `.env`.
4. Set `DB_USER` and `DB_PASSWORD` to the PostgreSQL login you use in pgAdmin.
5. Keep `DB_HOST=127.0.0.1` and `DB_PORT=5432` unless your installation uses
   different values.

Do not commit `.env`; it is intentionally ignored by Git.

## Install and run

```bash
npm install
npm run dev
```

The development command starts the API with Nodemon and restarts it
automatically when project files change. PM2 remains available separately with
`npm run pm2` and uses the watch configuration in `ecosystem.config.js`.

The API defaults to `http://localhost:8000`. A database readiness endpoint is
available at `GET /health`.

## Schema management

The application authenticates with PostgreSQL and runs
`sequelize.sync({ alter: true })` during startup. Sequelize creates missing
tables and aligns existing tables with the model definitions, following the
same schema-management approach as the BidIndex backend.

Create the PostgreSQL database itself in pgAdmin before starting the API.

## Logging

Application, HTTP request, database lifecycle, email, and process-level failures
use structured Pino logs. Development output is formatted by `pino-pretty` when
the application runs in development. Each event displays a colored status icon
and message, a compact context line, and a local timestamp using the
`DD-MM-YYYY hh:mm:ss AM/PM GMT+offset` format. Production logs remain
machine-readable JSON.

Sensitive authorization headers, cookies, and password fields are redacted. Set
`LOG_LEVEL` to `debug`, `info`, `warn`, or `error`. SQL logging is disabled by
default and can be enabled with `DB_LOGGING=true`.

## Useful commands

```bash
npm run check
npm run format
npm run format:check
npm start
```
