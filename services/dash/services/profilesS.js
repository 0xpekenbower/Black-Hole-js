import pool from "../config/pooling.js"
import URS from './relationsS.js'
import axios from 'axios'

const status_types = {
    HE_SENT: 3,
    HE_FR: 2,
    HE_BLK: 1,

    I_SENT: -3,
    I_FR: -2,
    I_BLK: -1
}

const relation_type = async (id, req_id) => //req_id -> token_id
{
    const fr_or_blocked = await pool.query('SELECT status FROM friends WHERE \
        (sender = $1 AND receiver = $2);', [id, req_id])

    if (fr_or_blocked.rowCount)
    {
        const status = fr_or_blocked.rows[0].status
        if (!status)
            return status_types.HE_SENT //he sent me a fr
        if (status == 1)
            return status_types.HE_FR //we re friends
        return status_types.HE_BLK //he blocked me
    }

    const fr_or_blocked2 = await pool.query('SELECT status FROM friends WHERE \
        sender = $1 AND receiver = $2;', [req_id, id])

    if (fr_or_blocked2.rowCount)
    {
        const status = fr_or_blocked2.rows[0].status
        if (!status)
            return status_types.I_SENT //i sent him a fr req
        if (status == 1)
            return status_types.I_FR //we re friends
        return status_types.I_BLK //i blocked him
    }
    return 0
}

export default {

    async display_profile(id, req_id) { //req_id -> token id
        let user_data = await pool.query('SELECT id, username, first_name, \
                last_name, avatar, background, bio, is_online, is_oauth, exp, rank, level \
                FROM player WHERE id = $1;', [id])
        
        if (!user_data.rows.length)
            throw new Error('User does not exist')

        user_data = user_data.rows[0]

        const rank_data = await pool.query('SELECT name, min_exp, max_exp, \
            reward, icon_path FROM ranks WHERE id = $1', [user_data.rank])

        const level_data = await pool.query('SELECT id, min_exp, max_exp, \
            reward FROM levels WHERE id = $1', [user_data.level])

        const relation = await relation_type(id, req_id)

        let friends = await URS.FriendList(id)
        
        const fr_list = friends.map((fr) => {
            if (fr.receiver == id)
                return fr.sender
            return fr.receiver
        })
        // console.log(friends)
        console.log(
            "User", user_data,
            "Level", level_data.rows[0],
            "Rank", rank_data.rows[0],
            "Friends", fr_list,
            "is_self", id == req_id,
            "Friendship", relation
        );
        return {
            "User": user_data,
            "Level": level_data.rows[0],
            "Rank": rank_data.rows[0],
            "Friends": fr_list,
            "is_self": id == req_id,
            "Friendship": relation
        }
    },

    async searchS(username)
    {
        const res = await pool.query("SELECT id, username FROM player WHERE \
            username LIKE $1 LIMIT 5;", [`%${username}%`])
        return res.rows
    },

    async changePassS(TOKEN, old_pass, new_pass)
    {  
        //TODO IF THE PASS CHANGED THE TOKEN WILL STILL WORK
        //YOU CAN ADD TOKEN VERSION -- UPDATE IT WHEN THE PASS CHANGED
        await axios.post(process.env.AUTH_PCHANGE, 
            { old_pass:old_pass, new_pass:new_pass },
            { headers: { Authorization: TOKEN } }
        )
    },

    async editS(accountID, first_name, last_name, bio, avatar, background)
    {
        await pool.query('UPDATE player SET \
            first_name = COALESCE($2, first_name), \
            last_name = COALESCE($3, last_name),  \
            bio = COALESCE($4, bio),  \
            avatar = COALESCE($5, avatar),  \
            background = COALESCE($6, background)  \
            WHERE id = $1;', [accountID, first_name, last_name, bio, avatar, background])
    }
}
