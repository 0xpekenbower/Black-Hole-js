import { Pool } from "pg"

const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.db_name,
    // database: process.env.DB_AUTH,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

export default pool
