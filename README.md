# DevsPark Backend

Node.js and Express API backed by PostgreSQL through Sequelize. The project uses
versioned database migrations, UUID primary keys, structured Pino logging, JWT
authentication, and transactional email verification.

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
npm run db:migrate
npm run dev
```

The API defaults to `http://localhost:8000`. A database readiness endpoint is
available at `GET /health`.

## Database commands

```bash
# Create the configured local database from the command line (optional)
npm run db:create

# Apply all pending schema migrations
npm run db:migrate

# Inspect migration state
npm run db:migrate:status

# Revert the most recent migration
npm run db:migrate:undo
```

Schema synchronization is deliberately not run during application startup.
Every schema change should be represented by a new migration so deployments are
repeatable and reversible.

## Logging

Application, HTTP request, database lifecycle, email, and process-level failures
use structured Pino logs. Development output is formatted by `pino-pretty` when
the process is attached to a terminal. Production logs remain machine-readable
JSON.

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
