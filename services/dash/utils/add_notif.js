import pool from "../config/pooling.js"

const add_notif = async (accountID, otherID, notif_type) => {
    await pool.query('INSERT INTO notifs(sender, receiver, notif_type) \
        VALUES($1, $2, $3);', [accountID, otherID, notif_type])
}

/**
 * notif types -> 1 -> fr_req
 *                2 -> fr_accepted my req
 *                3 -> new_msg
 */

export default add_notif
