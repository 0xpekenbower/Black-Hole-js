import https from 'https'
import fs from 'fs'
import path from 'path'
import pool from '../config/pooling.js'
import kafka from '../config/kafkaClient.js'

const DEFAULT_AVATAR = path.join(process.cwd(), 'media', 'avatar', 'default_avatar.jpg')


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
    
    if (try_login.rows[0])
        return jwt.sign({id: try_login.rows[0].id})

    const search = await pool.query('SELECT EXISTS(SELECT 1 FROM account WHERE username = $1 OR email = $2);', lvalues)
    
    if (search.rows[0].exists)
    {
        const err = new Error('Your username/email is not unique')
        err.status = 409
        throw err
    }
    // NO NEED TO DOWNLOAD AVATAR IS AVAILABLE IN  user_json.image.link 
    // let file_path = path.join(process.cwd(), 'media', 'avatar', `${user_json.login}.jpg`)
    // let avatar_path = user_json.image.link;
    // // in case
    // console.log(avatar_path);
    // if (fs.existsSync(file_path))
    //     fs.unlink(file_path, (err) => {
    //         if (err) throw new Error(`Cannot unlink ${file_path}`)
    //         else console.log('File Deleted');
    // })

    // const file_fs = fs.createWriteStream(file_path)
    // https.get(user_json.image.link, (response) => {
    //     response.pipe(file_fs)
    //     file_fs.on('finish', ()=>{
    //         file_fs.close(() => {
    //             console.log('File Downloaded Succesfuly')
    //         })
    //     })
    //     .on('error', () => {
    //         file_fs.unlink(file_path, () => {
    //             console.log('Error downloading the file')
    //             file_path = DEFAULT_AVATAR
    //         })
    //     })
    // })

    const new_user = [user_json.login, user_json.email, 'R3ndom789KEPLERliok',user_json.first_name, user_json.last_name, true, user_json.image.link]
    const created_user = await pool.query('INSERT INTO account(username, email, password, first_name, last_name, is_oauth, avatar) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id;', new_user)
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