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
      const client = new Client({ 
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        host: 'postgres_db',
        port: 5432
      });
      await client.connect();
      await client.end();
      return;
    } catch (error) {
      console.log('Waiting for postgres to be ready...', error.message);
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
    host: 'postgres_db',
    port: 5432,
  });
  await rootClient.connect();

  // Set timezone
  await rootClient.query(`SET TIME ZONE '${TIMEZONE}';`);
  
  // Create users if they don't exist
  const users = [
    { name: AUTH_DB_USER, password: AUTH_DB_PASSWORD },
    { name: CHAT_DB_USER, password: CHAT_DB_PASSWORD },
    { name: GAME_DB_USER, password: GAME_DB_PASSWORD },
    { name: USER_DB_USER, password: USER_DB_PASSWORD },
    { name: MONITOR_DB_USER, password: MONITOR_DB_PASSWORD }
  ];

  for (const user of users) {
    try {
      await rootClient.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${user.name}') THEN
            CREATE USER "${user.name}" WITH PASSWORD '${user.password}';
          END IF;
        END
        $$;
      `);
      console.log(`User ${user.name} created or already exists`);
    } catch (error) {
      console.error(`Error creating user ${user.name}:`, error.message);
    }
  }

  // Create admin user if not exists
  try {
    await rootClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${ADMIN_DB_USER}') THEN
          CREATE USER "${ADMIN_DB_USER}" WITH 
            SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS
            PASSWORD '${ADMIN_DB_PASSWORD}';
        END IF;
      END
      $$;
    `);
    console.log(`Admin user ${ADMIN_DB_USER} created or already exists`);
  } catch (error) {
    console.error(`Error creating admin user:`, error.message);
  }

  // Create databases individually (outside transaction)
  const databases = [
    { name: AUTH_DB_NAME, owner: AUTH_DB_USER },
    { name: CHAT_DB_NAME, owner: CHAT_DB_USER },
    { name: GAME_DB_NAME, owner: GAME_DB_USER },
    { name: USER_DB_NAME, owner: USER_DB_USER }
  ];

  for (const db of databases) {
    try {
      // Check if database exists
      const dbCheckResult = await rootClient.query(`
        SELECT 1 FROM pg_database WHERE datname = '${db.name}'
      `);
      
      if (dbCheckResult.rows.length === 0) {
        await rootClient.query(`CREATE DATABASE "${db.name}" OWNER "${db.owner}";`);
        console.log(`Database ${db.name} created`);
      } else {
        console.log(`Database ${db.name} already exists`);
      }
    } catch (error) {
      console.error(`Error creating database ${db.name}:`, error.message);
    }
  }

  // Grant privileges
  try {
    await rootClient.query(`
      GRANT ALL PRIVILEGES ON DATABASE "${AUTH_DB_NAME}" TO "${ADMIN_DB_USER}";
      GRANT ALL PRIVILEGES ON DATABASE "${CHAT_DB_NAME}" TO "${ADMIN_DB_USER}";
      GRANT ALL PRIVILEGES ON DATABASE "${GAME_DB_NAME}" TO "${ADMIN_DB_USER}";
      GRANT ALL PRIVILEGES ON DATABASE "${USER_DB_NAME}" TO "${ADMIN_DB_USER}";

      GRANT pg_monitor, pg_read_all_settings, pg_read_all_stats, pg_stat_scan_tables TO "${MONITOR_DB_USER}";
    `);
    console.log('Privileges granted successfully');
  } catch (error) {
    console.error('Error granting privileges:', error.message);
  }

  await rootClient.end();

//   // Setup schema + Users table in AUTH_DB_NAME
//   const authClient = new Client({
//     user: POSTGRES_USER,
//     password: POSTGRES_PASSWORD,
//     database: AUTH_DB_NAME
//   });
//   await authClient.connect();

//   const authSQL = `
//     REVOKE ALL ON SCHEMA public FROM PUBLIC;
//     GRANT USAGE ON SCHEMA public TO "${AUTH_DB_USER}";
//     GRANT ALL ON SCHEMA public TO "${ADMIN_DB_USER}";

//     CREATE TABLE IF NOT EXISTS "Users" (
//       "id" SERIAL PRIMARY KEY,
//       "email" VARCHAR(255) NOT NULL UNIQUE,
//       "password" VARCHAR(255) NOT NULL,
//       "twoFactorSecret" VARCHAR(255),
//       "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
//       "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
//     );

//     CREATE INDEX IF NOT EXISTS "users_email_idx" ON "Users" ("email");

//     GRANT ALL PRIVILEGES ON DATABASE "${AUTH_DB_NAME}" TO "${AUTH_DB_USER}";
//     GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${AUTH_DB_USER}";
//     GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${AUTH_DB_USER}";
//     GRANT ALL PRIVILEGES ON SCHEMA public TO "${AUTH_DB_USER}";

//     ALTER TABLE "Users" OWNER TO "${AUTH_DB_USER}";
//   `;

//   await authClient.query(authSQL);
//   await authClient.end();

  console.log('PostgreSQL setup complete!');
}

(async () => {
  await waitForPostgres();
  await runSetup();
})();
