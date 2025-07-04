import pool from "../config/pooling.js"


const convS = async (accountID) => {

    const msg_data = await pool.query("WITH conv AS (SELECT *, GREATEST(user1, user2) AS u1, LEAST(user1, user2) AS u2 \
        FROM msg WHERE user1 = $1 OR user2 = $1), \
        last_msg AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY u1, u2 ORDER BY created_at DESC) FROM conv) \
        SELECT id, username, first_name, last_name, avatar, background, last_msg.data \
        AS last_message FROM chatter INNER JOIN last_msg \
        ON (id = (CASE WHEN user1 != $1 THEN user1 ELSE user2 END) AND (row_number = 1))", [accountID]) 

    return msg_data.rows
}

export default convS