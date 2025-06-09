import bcrypt from 'bcrypt'
import pool from '../config/pooling.js'
import kafka from '../config/kafkaClient.js'

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

const emailValidator = (email) =>
{
    return (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

const registerS = async (username , email, password, repassword, first_name, last_name) => {
    if (emailValidator(email))
        throw new Error("Email does not comply with requirements")
    
    if (password !== repassword)
        throw new Error('Passwords do not match.')
    
    let errors = passValidator(password)
    if (errors.length)
        throw new Error(errors)
    
    first_name = last_name
    const tvals = [username , email, await bcrypt.hash(password, 10), first_name, last_name]
    
    const id = await pool.query('INSERT INTO account(username, email, password, first_name, last_name)  \
        VALUES($1, $2, $3, $4, $5) RETURNING id;', tvals)

    // if (process.env.db_name.search('test') == -1) //FIXME TO SEPARATE THE UNIT TESTING
    // {
        const prod = kafka.producer()
        
        await prod.connect()
        await prod.send({
                topic: 'newUser',
                messages : [ {value : JSON.stringify({
                    id:id.rows[0].id,
                    username: username,
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    is_oauth: false
                })
            }]
        })
        await prod.disconnect()
    // }
}

export default registerS