import bcrypt from 'bcrypt'
import pool from '../config/pooling.js'

const changePassS = async (accountID, old_pass, new_pass) => {
    const login_pass = await pool.query('SELECT password FROM account WHERE id = $1;', [accountID])
    
    const is_match = await bcrypt.compare(old_pass, login_pass.rows[0].password)
    
    if (!is_match)
        throw new Error('Invalid old password')
    
    const new_hashed = await bcrypt.hash(new_pass, 10)
    await pool.query('UPDATE account SET password = $1 WHERE id = $2;', [new_hashed, accountID])
}

export default changePassS