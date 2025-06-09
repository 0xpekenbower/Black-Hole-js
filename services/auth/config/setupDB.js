import { Client } from 'pg'
import fs from 'fs'

const setupdb = async () => {
    try
    {
        const client = new Client({
            user: 'auth',
            host: 'postgres_db',
            database: 'auth_db',
            password: 'authdbmMp',
            port: 5432
        });

        await client.connect()
        // const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1;', [process.env.AUTH_DB_NAME])
        // if (!res.rowCount)
        // {
        //     await client.query(`CREATE DATABASE ${process.env.AUTH_DB_NAME};`) //SQL INJ
        //     console.log(`${process.env.AUTH_DB_NAME} CREATED`)
        // }
        await client.end()


        const client2 = new Client({
            user: 'auth',
            host: 'postgres_db',
            database: 'auth_db',
            password: 'authdbmMp',
            port: 5432
        });

        await client2.connect()
    
        const query = fs.readFileSync('./models/initDB.sql', 'utf-8')
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