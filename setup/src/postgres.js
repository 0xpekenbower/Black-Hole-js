#!/usr/bin/env node

const { Client } = require('pg');

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  TIMEZONE,
  AUTH_DB_USER,
  AUTH_DB_PASSWORD,
  CHAT_DB_USER,
  CHAT_DB_PASSWORD,
  GAME_DB_USER,
  GAME_DB_PASSWORD,
  USER_DB_USER,
  USER_DB_PASSWORD,
  MONITOR_DB_USER,
  MONITOR_DB_PASSWORD,
  ADMIN_DB_USER,
  ADMIN_DB_PASSWORD,
  AUTH_DB_NAME,
  CHAT_DB_NAME,
  GAME_DB_NAME,
  USER_DB_NAME
} = process.env;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForPostgres() {
  for (let i = 0; i < 30; i++) {
    try {
      const client = new Client({ user: POSTGRES_USER });
      await client.connect();
      await client.end();
      return;
    } catch {
      console.log('Waiting for postgres to be ready...');
      await sleep(2000);
    }
  }
  console.error('Postgres did not become ready in time');
  process.exit(1);
}

async function runSetup() {
  const rootClient = new Client({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: 'postgres',
    host: 'localhost',
    port: 5432,
  });
  await rootClient.connect();

  const sql = `
    SET TIME ZONE '${TIMEZONE}';

    CREATE USER "${AUTH_DB_USER}" WITH PASSWORD '${AUTH_DB_PASSWORD}';
    CREATE USER "${CHAT_DB_USER}" WITH PASSWORD '${CHAT_DB_PASSWORD}';
    CREATE USER "${GAME_DB_USER}" WITH PASSWORD '${GAME_DB_PASSWORD}';
    CREATE USER "${USER_DB_USER}" WITH PASSWORD '${USER_DB_PASSWORD}';
    CREATE USER "${MONITOR_DB_USER}" WITH PASSWORD '${MONITOR_DB_PASSWORD}';

    CREATE USER "${ADMIN_DB_USER}" WITH 
      SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS
      PASSWORD '${ADMIN_DB_PASSWORD}';

    CREATE DATABASE "${AUTH_DB_NAME}" OWNER "${AUTH_DB_USER}";
    CREATE DATABASE "${CHAT_DB_NAME}" OWNER "${CHAT_DB_USER}";
    CREATE DATABASE "${GAME_DB_NAME}" OWNER "${GAME_DB_USER}";
    CREATE DATABASE "${USER_DB_NAME}" OWNER "${USER_DB_USER}";

    GRANT ALL PRIVILEGES ON DATABASE "${AUTH_DB_NAME}" TO "${ADMIN_DB_USER}";
    GRANT ALL PRIVILEGES ON DATABASE "${CHAT_DB_NAME}" TO "${ADMIN_DB_USER}";
    GRANT ALL PRIVILEGES ON DATABASE "${GAME_DB_NAME}" TO "${ADMIN_DB_USER}";
    GRANT ALL PRIVILEGES ON DATABASE "${USER_DB_NAME}" TO "${ADMIN_DB_USER}";

    GRANT pg_monitor, pg_read_all_settings, pg_read_all_stats, pg_stat_scan_tables TO "${MONITOR_DB_USER}";
  `;

  await rootClient.query(sql);
  await rootClient.end();

  // Setup schema + Users table in AUTH_DB_NAME
  const authClient = new Client({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: AUTH_DB_NAME
  });
  await authClient.connect();

  const authSQL = `
    REVOKE ALL ON SCHEMA public FROM PUBLIC;
    GRANT USAGE ON SCHEMA public TO "${AUTH_DB_USER}";
    GRANT ALL ON SCHEMA public TO "${ADMIN_DB_USER}";

    CREATE TABLE IF NOT EXISTS "Users" (
      "id" SERIAL PRIMARY KEY,
      "email" VARCHAR(255) NOT NULL UNIQUE,
      "password" VARCHAR(255) NOT NULL,
      "twoFactorSecret" VARCHAR(255),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS "users_email_idx" ON "Users" ("email");

    GRANT ALL PRIVILEGES ON DATABASE "${AUTH_DB_NAME}" TO "${AUTH_DB_USER}";
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${AUTH_DB_USER}";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${AUTH_DB_USER}";
    GRANT ALL PRIVILEGES ON SCHEMA public TO "${AUTH_DB_USER}";

    ALTER TABLE "Users" OWNER TO "${AUTH_DB_USER}";
  `;

  await authClient.query(authSQL);
  await authClient.end();

  console.log('PostgreSQL setup complete!');
}

(async () => {
  await waitForPostgres();
  await runSetup();
})();
