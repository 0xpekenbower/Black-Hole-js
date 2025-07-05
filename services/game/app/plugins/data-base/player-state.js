
import FP from 'fastify-plugin';
import FS from 'fs';
import { fileURLToPath } from 'url';
import Path from 'path';
import { Pool } from 'pg';



const db = new Pool({
	user: 'game',
	host: 'postgres_db',
	database: 'game_db',
	password: process.env.GAME_DB_PASSWORD,
	port: 5432
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

console.log("ENV PASSWD:", process.env.GAME_DB_PASSWORD);

async function dataBasePlugin(fastify) {
	try {
		await db.query('SELECT 1');
		fastify.log.info('PostgreSQL connected ✔️');
		{
			const dbTempPath = __dirname + '/templates' + '/user.sql';
			const userQuery = FS.readFileSync(dbTempPath, 'utf-8');
			await db.query(userQuery);
		}
		{
			const dbTempPath = __dirname + '/templates' + '/history.sql';
			const history = FS.readFileSync(dbTempPath, 'utf-8');
			await db.query(history);
		}

	} catch (err) {
		fastify.log.error('Failed to connect to PostgreSQL ❌', err);
		throw err;
	}


	// Custom methods 
	const run = async (sql, params = []) => {
		await db.query(sql, params);
	};

	const get = async (sql, params = []) => {
		const { rows } = await db.query(sql, params);
		return rows[0];
	};

	const userDataBase = {
		async createUser(user) {
			const sql = ` INSERT INTO connected_users (user_id) VALUES ($1)
					ON CONFLICT (user_id) DO NOTHING`;
			await run(sql, [user]);
			return user;
		},

		async updateState(user_id, state) {
			const sql = ` UPDATE connected_users
					SET state = $1, updated_at = CURRENT_TIMESTAMP
					WHERE user_id = $2`;
			await run(sql, [state, user_id]);
			return user_id;
		},

		async getState(user_id) {
			const sql = `SELECT state FROM connected_users WHERE user_id = $1`;
			const row = await get(sql, [user_id]);
			return row?.state || null;
		},

		async resetUsersState() {
			const sql = `UPDATE connected_users SET state = 'offline'`;
			await run(sql);
		},


		async createHistory({ player_id, rival_id, winner_id }) {
			const sql = `
			  INSERT INTO game_history (
				player_id,
				rival_id,
				winner_id
			  ) VALUES ($1, $2, $3)`;

			await run(sql, [
				player_id,
				rival_id,
				winner_id
			]);
		},

		async getHistory(playerId) {
			const sql = `
			  SELECT
				rival_id
			  FROM game_history
			  WHERE player_id = $1
			`;

			const result = await db.query(sql, [playerId]);


			return result.rows.map((row) => ({
				rival_id: row.rival_id
			}));
		}



	};

	fastify.decorate('UserDataBase', userDataBase);
	fastify.log.info('UserDataBase decorated ✔️');
	fastify.addHook('onClose', async (fastify, done) => {
		await db.end();
		done();
	});

}

export default FP(dataBasePlugin);


