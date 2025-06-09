import send_mail from "../config/email.js"
import pool from "../config/pooling.js"
import bcrypt from 'bcrypt'
import otp from 'otp-generator'

export default {
    async loginS (jwt, username, password) {

        const user = await pool.query(`SELECT id, password, is_otp, email FROM account     \
            WHERE username = '${username}' AND is_oauth = false;`)
        if (!user.rows.length)
        {
            const err = new Error("User does not exist")
            err.status = 401
            throw err
        }
        const is_match = await bcrypt.compare(password, user.rows[0].password)
        if (!is_match)
        {
            const err = new Error("Incorrect Password")
            err.status = 401
            throw err
        }
        
        if (user.rows[0].is_otp)
        {
            const code = otp.generate(6, { digits: true,
                alphabets: false, upperCase: false, specialChars: false })
            
            await pool.query('DELETE FROM twofa WHERE id = $1', [user.rows[0].id])
            
            await pool.query('INSERT INTO twofa(id, otp_code) VALUES($1, $2);',
                [user.rows[0].id, code])

            await send_mail(user.rows[0].email, code)

            return -1
        }

        return jwt.sign({id: user.rows[0].id})
    },
}