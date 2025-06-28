
import Sqlite from 'sqlite3';
import FS from 'fs';
import FP from 'fastify-plugin';
import Path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);


async function dataBasePlugin(fastify) {

	try {
		const dataBase = new Sqlite.Database('./UserStateDB.sqlite');
		fastify.log.info("connected to data-base");
		const db_user = __dirname + '/templates' + '/user.sql';
		console.log('Path: ', db_user);
		const query = FS.readFileSync(db_user, 'utf-8');
		console.log(query);
		dataBase.exec(query, (err) => {
			if (err)
				return fastify.log.error("Failed to execute query: ", query, err);
			fastify.log.info("SQL schema (User) loaded");
		});


		const userDataBase = {
			createUser: (user) => {
				return new Promise((resolve, reject) => {
					const sql = `INSERT INTO connected_users (user_id) VALUES (?)`
					dataBase.run(sql, [user], (err) => {
						if (err) reject();
						else resolve(user);
					});
				});
			},

			updateState: (user_id, state) => {
				return new Promise((resolve, reject) => {
					const sql = `
							UPDATE connected_users 
							SET state = ?, updated_at = CURRENT_TIMESTAMP	
							WHERE user_id = ?`;
					dataBase.run(sql, [state, user_id], (err) => {
						if (err) reject();
						else resolve();
					});
				});
			},

			getState: (user_id) => {
				return new Promise((resolve, reject) => {
					const sql = `SELECT state FROM connected_users WHERE user_id = ?`;
					dataBase.get(sql, [user_id], (err, row) => {
						if (err) reject(err);
						else resolve(row?.state);
					});
				});
			},

			resetUsersState: () => {
				return new Promise((resolve, reject) => {
					const sql = `
							UPDATE connected_users
							SET state = 'offline';`;
					dataBase.run(sql, [], (err) => {
						if (err) reject(err);
						else resolve();
					})
				})
			}

			// getState: (user_id) => {
			// 	const sql = `
			// 			SELECT state FROM connected_users 
			// 			WHERE user_id = ?`;

			// 	return dataBase.get(sql, [user_id], () => { });

			// }

		}

		fastify.decorate('UserDataBase', userDataBase);

	} catch {
		fastify.log.error("failed to connect to data-base");
	}


}


export default FP(dataBasePlugin);
