import otp from 'otp-generator'
import pool from '../config/pooling.js'
import send_mail from '../config/email.js'
import bcrypt from 'bcrypt'

function passValidator (password) {
    let errors = []
    if (password && password.length < 10)
        errors.push('Password must contain at least 10 characters')
    if (!/[a-z]/.test(password))
        errors.push('Password must contain [a-z]')
    if (!/[A-Z]/.test(password))
        errors.push('Password must contain [A-Z]')
    if (!/[0-9]/.test(password))
        errors.push('Password must contain [0-9]')
    if (!/[@$!%*?&'"]/.test(password))
        errors.push('Password must contain [@$!%*?&\'"]')
    return errors
}


export default {
    async send_mailS(email) {
        const check = await pool.query('SELECT EXISTS(SELECT 1 FROM account \
             WHERE email = $1);', [email])
        if (!check.rows[0].exists)
            throw new Error('Email does not exist')
        
        await pool.query('DELETE FROM change_pass WHERE email = $1;', [email])

        const code = otp.generate(6, { upperCaseAlphabets: false, specialChars: false})

        await send_mail(email, code)
        
        await pool.query('INSERT INTO change_pass(email, otp_code) \
            VALUES($1, $2);', [email, code])
    },

    async forget_passS(email, code, password) {
        const errs = passValidator(password)
        if (errs.length)
            throw new Error(errs)

        const check = await pool.query('SELECT EXISTS(SELECT 1 FROM change_pass \
            WHERE email = $1 AND otp_code = $2);', [email, code])
        if (!check.rows[0].exists)
            throw new Error('Incorrect email/code')

        
        const is_expired = await pool.query(`SELECT EXISTS (SELECT 1 FROM change_pass \
            WHERE otp_code = $1 AND created_at < NOW() - INTERVAL '10 minutes')`, [code])
        
        await pool.query('DELETE FROM change_pass WHERE email = $1;', [email])

        if (is_expired.rows[0].exists)
            throw new Error('The code expired')
        const new_hashed = await bcrypt.hash(password, 10)
        await pool.query('UPDATE account SET password = $1 WHERE email = $2;', [new_hashed, email])
    },

}