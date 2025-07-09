import pool from "../config/pooling.js"
import {authenticator} from 'otplib'

const twofaS = async(code, username) => {
    const query = await pool.query("SELECT otp_secret, id FROM account \
        WHERE username = $1", [username])

    if (!query.rowCount)
        throw new Error('User does not exist')

    const {otp_secret, id} = query.rows[0]
    
    const verify = authenticator.check(code, otp_secret)

    if (verify)
        return jwt.sign({id: id})

    throw new Error('invalid otp-code')
}

export default twofaS