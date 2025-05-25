import { Client } from 'pg'
import fs from 'fs'

const setupdb = async (db_name) => {
    try
    {
        const client = new Client({
            user: 'buddha',
            host: 'localhost',
            password: 'buddha',
            port: 5999,
            database: 'postgres'
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
            user: 'buddha',
            host: 'localhost',
            password: 'buddha',
            port: 5999,
            database: db_name
        });

        await client2.connect()
    

        let query = fs.readFileSync('./models/dashTables.sql', 'utf-8')
        query += fs.readFileSync('./models/levels.sql', 'utf-8')
        query += fs.readFileSync('./models/ranks.sql', 'utf-8')
        query += fs.readFileSync('./models/achievements.sql', 'utf-8')
        await client2.query(query)
        await client2.end()
        console.log('[DB-DASH] init done')
    }
    catch(err)
    {
        console.log(`[DB-DASH] ${err}`)
        process.exit(1)
    }
}

export default setupdb