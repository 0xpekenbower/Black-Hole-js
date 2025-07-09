import pool from "../config/pooling.js"
import kafkaProd from '../config/kafkaProd.js'

const sendMsgS = async (accountID, otherID, data) => {

    if (accountID == otherID)
        throw new Error('you cannot send a msg to yourself')

    const user1 = Math.max(accountID, otherID)
    const user2 = Math.min(accountID, otherID)

    const created = new Date()

    await kafkaProd('newMsg', {
        sender: accountID,
        receiver: otherID,
        msg: data,
        created_at: created
    })

    await pool.query('INSERT INTO msg(user1, user2, sender, data, created_at) \
        VALUES($1, $2, $3, $4, $5)', [user1, user2, accountID, data, created])

}

export default sendMsgS