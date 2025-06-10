import pool from '../config/pooling.js'

export default {
    async buyS(accoundID, item_id, item_type, table_name) {
        const check = await pool.query(`                                
            WITH item_price AS 
                (SELECT price from ${table_name} WHERE id = $1),        
            
            user_budget AS
                (SELECT budget FROM player WHERE id = $2),  

            legit_trans AS 
                (SELECT                          
                    ((SELECT price from item_price) <= (SELECT budget FROM user_budget)) AS has_budget),
            
            budget_update AS (
                UPDATE player SET budget = budget - (SELECT price from item_price) 
                WHERE
                    id = $2 AND
                    (SELECT has_budget FROM legit_trans)
                RETURNING (SELECT has_budget FROM legit_trans) AS success)

            INSERT INTO inventory(user_id, item_id, item_type) SELECT $2, $1, $3
            WHERE (SELECT has_budget FROM legit_trans) = true
            RETURNING (SELECT success FROM budget_update)
            `, [item_id, accoundID, item_type])

        return check.rowCount > 0 && check.rows[0].success
    },

    async list_inventoryS(accoundID) {
        const list = await pool.query(`SELECT item_id, item_type FROM inventory 
            WHERE user_id = $1`, [accoundID])
        const budgetQuery = await pool.query(`SELECT budget FROM player WHERE id = $1`, [accoundID])
        const budget = budgetQuery.rows.length > 0 ? budgetQuery.rows[0].budget : 0        
        return {
            inventory: list.rows,
            coins: budget
        }
    }
}