import { Client } from 'pg'
import fs from 'fs'

const setupdb = async (db_name) => {
    try
    {
        const client = new Client({
            user: process.env.DB_USERNAME,
            host: process.env.DB_HOST,
            database: 'postgres',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        await client.connect()
        const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1;', [db_name])
        if (!res.rowCount)
        {
            await client.query(`CREATE DATABASE ${db_name};`) //SQL INJ
            console.log(`${db_name} CREATED`)
        }
        await client.end()


        const client2 = new Client({
            user: process.env.DB_USERNAME,
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: db_name
        });

        await client2.connect()
    
        const query = fs.readFileSync('./models/chatTables.sql', 'utf-8')
        await client2.query(query)
        await client2.end()
        console.log('[DB] init done')
    }
    catch(err)
    {
        console.log(`[DB] ${err}`)
        process.exit(1)
    }
}

export default setupdb