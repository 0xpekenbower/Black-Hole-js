import { OAuth2Client } from 'google-auth-library'
import pool from "../config/pooling.js"
import https from 'https'
import path from 'path'
import fs from 'fs'
import kafka from '../config/kafkaClient.js'

const DEFAULT_AVATAR = path.join(process.cwd(), 'media', 'avatar', 'default_avatar.jpg')

const googleS = async (jwt, code) => {

	const oauth2C = new OAuth2Client({
		clientId: process.env.CLIENT_ID_GOOGLE,
		clientSecret: process.env.CLIENT_SECRET_GOOGLE,
		redirectUri: process.env.GOOGLE_REDIRECT
	})

	const { tokens } = await oauth2C.getToken(code)

	oauth2C.setCredentials(tokens)

	const ticket = await oauth2C.verifyIdToken({
		idToken: tokens.id_token,
		audience: process.env.CLIENT_ID_GOOGLE
	})

	const user_json = await ticket.getPayload()

	const try_login = await pool.query('SELECT id FROM account WHERE username = $1 AND email = $2 AND is_oauth = $3', [user_json.name, user_json.email, true])

	if (try_login.rows[0])
		return jwt.sign({ id: try_login.rows[0].id })

	const search = await pool.query('SELECT EXISTS (SELECT 1 FROM account WHERE username = $1 OR email = $2)', [user_json.name, user_json.email])

	if (search.rows[0].exists) {
		const err = new Error('Your username/email is not unique')
		err.status = 409
		throw err
	}
	console.log(user_json);

	// let file_path = path.join(process.cwd(), 'media', 'avatar', `${user_json.name}.jpg`)
	// if (fs.existsSync(file_path))
	// 	fs.unlink(file_path, (err) => {
	// 		if (err) {
	// 			const error = new Error(`Cannot unlink ${file_path}`)
	// 			err.status = 400
	// 			throw error
	// 		}
	// 		else console.log('File Deleted');
	// 	})

	// const file_fs = fs.createWriteStream(file_path)
	// https.get(user_json.picture, (response) => {
	// 	response.pipe(file_fs)
	// 	file_fs.on('finish', () => {
	// 		file_fs.close(() => {
	// 			console.log('File Downloaded Succesfuly')
	// 		})
	// 	})
	// 		.on('error', () => {
	// 			file_fs.unlink(file_path, () => {
	// 				console.log('Error downloading the file')
	// 				file_path = DEFAULT_AVATAR
	// 			})
	// 		})
	// })

	// just n7awlo ndwzoha directy from google
	const avatar = user_json.picture ? user_json.picture : '/data/avatars/default.png'

	const new_user = [user_json.name, user_json.email, 'R3ndom789KEPLERliok', user_json.given_name, user_json.family_name, true, avatar]
	const created_user = await pool.query('INSERT INTO account(username, email, password, first_name, last_name, is_oauth, avatar) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id;', new_user)
	const prod = kafka.producer()
    
    await prod.connect()
    await prod.send({
            topic: 'newUser',
            messages : [ {value : JSON.stringify({
                id:created_user.rows[0].id,
                username: user_json.name,
                email: user_json.email,
                first_name: user_json.given_name,
                last_name: user_json.family_name,
                is_oauth: true,
                avatar: avatar,
                background: '/data/backgrounds/default.png'
            })
        }]
    })
    await prod.disconnect()
	return jwt.sign({ id: created_user.rows[0].id })
}

export default googleS