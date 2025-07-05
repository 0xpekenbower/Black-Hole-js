import pool from "../config/pooling.js"
import kafka from "../config/kafkaClient.js"

const add_notif = async (accountID, otherID, notif_type) => {
    await pool.query('INSERT INTO notifs(sender, receiver, notif_type) \
        VALUES($1, $2, $3);', [accountID, otherID, notif_type])

    const prod = kafka.producer()

    await prod.connect()
    await prod.send({
        topic: 'Relation',
        messages: [{
            value: JSON.stringify({
                sender: accountID,
                receiver: otherID,
                type: notif_type,
                created_at: new Date()
            })
        }]
    })
    await prod.disconnect()
}

/**
 * notif types -> 1 -> fr_req
 *                2 -> fr_accepted my req
 *                3 -> new_msg
 */

export default add_notif
