import registerS from "../services/registerS.js"
import pool from '../config/pooling.js'

const RegisterC = async (req, res) =>
{
    try
    {
        await pool.query('BEGIN')
        
        const {username , email, password, repassword, first_name, last_name} = req.body
        await registerS(username , email, password, repassword, first_name, last_name)
        
        await pool.query('COMMIT')
        res.status(201);
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        res.status(400).send({Error: err.message})
    }
}

export default RegisterC