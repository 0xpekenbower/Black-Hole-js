import path from 'path'
import pool from '../config/pooling.js'
import kafka from '../config/kafkaClient.js'
import {authenticator} from 'otplib'


const intraS = async (jwt, code) => {
    console.log(process.env.API_42)
    let params = {
        'code':code,
        'client_id' : process.env.CLIENT_ID_42,
        'client_secret': process.env.CLIENT_SECRET_42,
        'redirect_uri' : process.env.REDIRECT_42,
        'grant_type': 'authorization_code'
    }  
    const form_params = new URLSearchParams(params)
    //OAuth token endpoints require app/x-form
    
    const raw = await fetch(process.env.TOKEN_42,
        {
            method: 'POST',
            body: form_params,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        })
    if (!raw.ok)
    {
        const err = new Error(`${raw.status}`)
        err.status = 409
        throw err
    }
    
    const user_creds =  await raw.json()
    
    const user_data = await fetch(process.env.INTRA_42, {
        headers: {'Authorization': `Bearer ${user_creds['access_token']}`},
    })
    
    if (!user_data.ok)
    {
        const err = new Error(`[-] USER DATA ${user_data.status}`)
        err.status = 409
        throw err
    }

    const user_json =  await user_data.json()// JUST FOR DEBUGGING I WANT TO KNOW IF WE CAN GET THE DATA FROM INTRA , IF YES SO SHOULD CHECK KAFKA IF IT'S SEND INFO TO DASH SERVICE (i can't see profile of oauth users)
    // TODO: ask budha 
    // username and email and first_name and last_name are available in user_json so we only skip the password (because is oauth) but everything else should be the same 
    const lvalues = [user_json.login, user_json.email]
    let try_login = await pool.query('SELECT id FROM account WHERE username = $1 AND email = $2 AND is_oauth = true', lvalues)
    
    if (try_login.rowCount)
        return jwt.sign({id: try_login.rows[0].id})

    const search = await pool.query('SELECT EXISTS(SELECT 1 FROM account WHERE username = $1 OR email = $2);', lvalues)
    
    if (search.rows[0].exists)
    {
        const err = new Error('Your username/email is not unique')
        err.status = 409
        throw err
    }

    const otp_secret = authenticator.generateSecret()

    const new_user = [user_json.login, user_json.email, 'R3ndom789KEPLERliok', true, otp_secret]
    const created_user = await pool.query('INSERT INTO account(username, email, password, is_oauth, otp_secret) VALUES($1, $2, $3, $4, $5) RETURNING id;', new_user)
    const prod = kafka.producer()
    
    await prod.connect()
    await prod.send({
            topic: 'newUser',
            messages : [ {value : JSON.stringify({
                id:created_user.rows[0].id,
                username: user_json.login,
                email: user_json.email,
                first_name: user_json.first_name,
                last_name: user_json.last_name,
                otp_secret: otp_secret,
                is_oauth: true,
                avatar: user_json.image.link,
                background: '/data/backgrounds/default.png'
            })
        }]
    })
    await prod.disconnect()
    return jwt.sign({id:created_user.rows[0].id})
}

export default intraS