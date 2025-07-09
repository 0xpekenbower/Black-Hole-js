import pool from '../config/pooling.js'
import qrcode from 'qrcode'
import {authenticator} from 'otplib'
import kafkaProd from '../config/kafkaProd.js'

const twofaS = async (accountID, activate) => {
    // await pool.query('UPDATE account SET is_otp = $2 \
    //     WHERE id = $1', [accountID, activate])
    await kafkaProd('OTP', {
        id: accountID,
        activate: activate
    })

    if (activate)
    {
        const {otp_secret} = await pool.query('SELECT otp_secret FROM player \
            WHERE id = $1', [accountID]).rows[0]

        const keyUri = authenticator.keyuri(username, 'blackholejs', otp_secret)
        const qrcodeData = await qrcode.toDataURL(keyUri)

        return(qrcodeData)
    }
    return false
}

export default twofaS