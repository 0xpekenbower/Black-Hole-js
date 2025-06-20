#!/usr/bin/env node

const pg = require('pg');
const { Client } = pg;

const {
  POSTGRES_PASSWORD,
  AUTH_DB_PASSWORD,
  CHAT_DB_PASSWORD,
  GAME_DB_PASSWORD,
  DASH_DB_PASSWORD,
  MONITOR_DB_PASSWORD,
  ADMIN_DB_PASSWORD
} = process.env;
console.log(
  `${POSTGRES_PASSWORD},${AUTH_DB_PASSWORD}`
);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForPostgres() {
  for (let i = 0; i < 30; i++) {
    try {
      const client = new Client({ 
        user: 'postgres',
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
    user: 'postgres',
    password: POSTGRES_PASSWORD,
    database: 'postgres',
    host: 'postgres_db',
    port: 5432,
  });
  await rootClient.connect();

  await rootClient.query(`SET TIME ZONE 'Africa/Casablanca';`);
  
  const users = [
    { name: 'auth', password: AUTH_DB_PASSWORD },
    { name: 'chat', password: CHAT_DB_PASSWORD },
    { name: 'game', password: GAME_DB_PASSWORD },
    { name: 'dash', password: DASH_DB_PASSWORD },
    { name: 'monitor', password: MONITOR_DB_PASSWORD }
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
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
          CREATE USER "admin" WITH 
            SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS
            PASSWORD '${ADMIN_DB_PASSWORD}';
        END IF;
      END
      $$;
    `);
    console.log(`Admin user admin created or already exists`);
  } catch (error) {
    console.error(`Error creating admin user:`, error.message);
  }

  const databases = [
    { name: 'auth_db', owner: 'auth' },
    { name: 'chat_db', owner: 'chat' },
    { name: 'game_db', owner: 'game' },
    { name: 'dash_db', owner: 'dash' }
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
      GRANT ALL PRIVILEGES ON DATABASE "auth_db" TO "admin";
      GRANT ALL PRIVILEGES ON DATABASE "chat_db" TO "admin";
      GRANT ALL PRIVILEGES ON DATABASE "game_db" TO "admin";
      GRANT ALL PRIVILEGES ON DATABASE "dash_db" TO "admin";

      GRANT pg_monitor, pg_read_all_settings, pg_read_all_stats, pg_stat_scan_tables TO "monitor";
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
