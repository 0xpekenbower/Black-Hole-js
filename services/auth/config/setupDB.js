import { Client } from 'pg'
import fs from 'fs'

// Connection string for the auth database
const connectionString = `postgresql://${process.env.AUTH_DB_USER}:${process.env.AUTH_DB_PASSWORD}@postgres_db:5432/${process.env.AUTH_DB_NAME}`;

const setupdb = async () => {
    try {
        // Connect directly to the existing database
        const client = new Client({
            connectionString: connectionString
        });

        await client.connect()
    
        // Run initialization SQL
        const query = fs.readFileSync('./models/initDB.sql', 'utf-8')
        await client.query(query)
        await client.end()
        console.log('[DB] init done')
    }
    catch(err) {
        console.log(`[DB] ${err}`)
        process.exit(1)
    }
}

export default setupdb