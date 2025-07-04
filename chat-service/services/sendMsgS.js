import pool from "../config/pooling.js"
import kafka from '../config/kafkaClient.js'


const sendMsgS = async (accountID, otherID, data) => {

    if (accountID == otherID)
        throw new Error('you cannot send a msg to yourself')

    const user1 = Math.max(accountID, otherID)
    const user2 = Math.min(accountID, otherID)

    const prod = kafka.producer()

    await prod.connect()

    const created = new Date() 
    await prod.send({
        topic: 'newMsg',
        messages: [
            {
                value: JSON.stringify({
                    sender: accountID,
                    receiver: otherID,
                    msg: data,
                    created_at: created
                })
            }
        ]
    })

    await pool.query('INSERT INTO msg(user1, user2, sender, data, created_at) \
        VALUES($1, $2, $3, $4, $5)', [user1, user2, accountID, data, created])

    await prod.disconnect()
}

export default sendMsgS