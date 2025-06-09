import pool from '../config/pooling.js'

export default {
    async limit4S(accountID)
    {
        const relation = await pool.query('SELECT sender, notif_type, is_readen, created_at     \
             FROM notifs WHERE receiver = $1 ORDER BY created_at DESC LIMIT 4;', [accountID])
        
        return (relation.rows)
    },

    async detailS(accountID)
    {
        const relation = await pool.query('SELECT sender, notif_type, is_readen, created_at     \
            FROM notifs WHERE receiver = $1 ORDER BY created_at DESC;', [accountID])
        return (relation.rows)
    },

    async seenS(accountID)
    {
        await pool.query('UPDATE notifs SET is_readen = true     \
            WHERE receiver = $1;', [accountID])
    },

    // async addS(accountID)
    // {
    //     await pool.query('INSERT INTO notifs SET is_readen = true     \
    //         WHERE receiver = $1;', [accountID])
    // },
}