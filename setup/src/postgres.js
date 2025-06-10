#!/usr/bin/env node

const pg = require('pg');
const { Client } = pg;

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

async function setupPostgres() {
  const rootClient = new Client({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: 'postgres',
    host: 'postgres_db',
    port: 5432,
  });
  await rootClient.connect();

  await rootClient.query(`SET TIME ZONE '${TIMEZONE}';`);
  
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

  const databases = [
    { name: AUTH_DB_NAME, owner: AUTH_DB_USER },
    { name: CHAT_DB_NAME, owner: CHAT_DB_USER },
    { name: GAME_DB_NAME, owner: GAME_DB_USER },
    { name: USER_DB_NAME, owner: USER_DB_USER }
  ];

  for (const db of databases) {
    try {
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
  console.log('PostgreSQL setup complete!');
}

if (require.main === module) {
  (async () => {
    await waitForPostgres();
    await setupPostgres();
  })();
}

module.exports = { setupPostgres };
