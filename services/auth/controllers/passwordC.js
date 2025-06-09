import changePassS from '../services/passwordS.js'
import pool from '../config/pooling.js'

const changePassC = (fastify) => async(req, res) => {
    try
    {
        await pool.query('BEGIN')
        const {old_pass, new_pass} = req.body

        const TOKEN = req.headers.authorization.split(" ")
        const accountID = fastify.jwt.decode(TOKEN[1])
        
        await changePassS(accountID.id, old_pass, new_pass)

        await pool.query('COMMIT')
        res.status(200)
    }
    catch(err)
    {
        await pool.query('ROLLBACK')

        res.status(400).send({Error: err.message})
    }
}

export default changePassC