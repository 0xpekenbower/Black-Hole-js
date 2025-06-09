import { Pool } from "pg"

const pool = new Pool({
    user: process.env.USER_DB_USER,
    host: 'postgres_db',
    database: process.env.USER_DB_NAME,
    password: process.env.USER_DB_PASSWORD,
    port: 5432
  });

export default pool
