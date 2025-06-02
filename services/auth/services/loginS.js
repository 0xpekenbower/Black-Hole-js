import pool from "../config/pooling.js"
import bcrypt from 'bcrypt'

export default {
    async loginS (jwt, username, password) {

        const user = await pool.query('SELECT id, password FROM account WHERE username = $1 AND is_oauth = false;', [username])
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
        
        return jwt.sign({id: user.rows[0].id})
    },
}