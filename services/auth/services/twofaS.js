import pool from "../config/pooling.js"

const twofaS = async(jwt, code, id) => {
    const check = await pool.query("SELECT EXISTS(SELECT 1 FROM     \
        twofa WHERE otp_code = $1 AND id = $2   \
        AND created_at > NOW() - INTERVAL '10 minutes')", [code, id])

    console.log(check.rows[0])
    if (check.rows[0].exists)
    {
        await pool.query('DELETE FROM twofa WHERE id = $1;', [id])
        return jwt.sign({id: id})
    }

    throw new Error('invalid/expired otp-code')
}

export default twofaS