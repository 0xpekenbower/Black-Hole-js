import pool from "../config/pooling.js"
import kafka from '../config/kafkaClient.js'


const sendMsgS = async (accountID, otherID, data) => {

    const user1 = Math.max(accountID, otherID)
    const user2 = Math.min(accountID, otherID)

    const prod = await kafka.producer()

    await prod.connect()
    await prod.send({
        topic: 'newMsg',
        messages: [
            {
                value: JSON.stringify({
                    sender: accountID,
                    receiver: otherID,
                    msg: data,
                    created_at: Date.now()
                })
            }
        ]
    })

    await prod.disconnect()

    await pool.query('INSERT INTO msg(user1, user2, sender, data) \
        VALUES($1, $2, $3, $4)', [user1, user2, accountID, data])
}

export default sendMsgS