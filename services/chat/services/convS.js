import pool from "../config/pooling.js"


const convS = async (accountID, otherID) => {

    const user1 = Math.max(otherID, accountID)
    const user2 = Math.min(otherID, accountID)

    const msg_data = await pool.query('SELECT sender, data, created_at \
        FROM msg WHERE user1 = $1 AND user2 = $2 ORDER BY created_at', [user1, user2])

    return msg_data.rows
}

export default convS