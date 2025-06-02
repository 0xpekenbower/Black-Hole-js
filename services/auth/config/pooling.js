import { Pool } from "pg"

const connectionString = `postgresql://${process.env.AUTH_DB_USER}:${process.env.AUTH_DB_PASSWORD}@postgres_db:5432/${process.env.AUTH_DB_NAME}`;

const pool = new Pool({
  connectionString: connectionString
});

export default pool
