import { Pool } from "pg"

const pool = new Pool({
    user: 'chat',
    host: 'postgres_db',
    database: 'chat_db',
    password: process.env.CHAT_DB_PASSWORD,
    port: 5432
  });
  
export default pool
