import { Pool } from "pg"

const pool = new Pool({
      user: 'auth',
      host: 'postgres_db',
      database: 'auth_db',
      password: process.env.AUTH_DB_PASSWORD,
      port: 5432
  });

export default pool
