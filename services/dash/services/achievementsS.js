import pool from "../config/pooling.js"

export default {
    async add_achievementsS(accountID, achievID, parts) {
        //await pool.query('BEGIN)
        const check = await pool.query('SELECT EXISTS(SELECT 1 FROM user_achiev WHERE \
            user_id = $1 AND achievement_id = $2);', [accountID, achievID])

        if (check.rows[0].exists)
            throw new Error('Achievement already exists')

        await pool.query('INSERT INTO user_achiev(user_id, achievement_id, parts) \
            VALUES($1, $2, $3);', [accountID, achievID, parts])

        const reward = await pool.query('SELECT coin_reward FROM achievements WHERE id = $1;', [achievID])

        await pool.query('UPDATE player SET budget = budget + $1    \
            WHERE id = $2', [reward.rows[0].coin_reward, accountID])
        //await pool.query('COMMIT')

        //TODO in case of err (on the catch) do ROLLBACK
    },

    async update_achievementsS(accountID, achievID, parts) {
        const check = await pool.query('SELECT EXISTS (SELECT 1 FROM user_achiev    \
            WHERE user_id = $1 AND achievement_id = $2);', [accountID, achievID])
        
        if (!check.rows[0].exists)
            throw new Error('The achievement does not exist in the player account')

        const max_parts = await pool.query('SELECT parts FROM achievements \
            WHERE id = $1;', [achievID])
        
        if (parts > max_parts.rows[0].parts)
            throw new Error('parts > max_parts')

        await pool.query('UPDATE user_achiev SET parts = $1 \
            WHERE user_id = $2 AND achievement_id = $3;', [parts, accountID, achievID])
    },

    async list_achievementsS(accountID) {
        const all = await pool.query('SELECT achievements.id, achievements.title, \
            achievements.description, achievements.coin_reward, user_achiev.parts, \
            achievements.parts AS total_parts, \
            achievements.icon_path FROM achievements INNER JOIN user_achiev \
            ON achievements.id = user_achiev.achievement_id      \
            WHERE user_achiev.user_id = $1;', [accountID])

        return all.rows
    },
}