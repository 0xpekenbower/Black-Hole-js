CREATE TABLE IF NOT EXISTS game_history (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    rival_id INTEGER NOT NULL,
    -- player_score INTEGER NOT NULL,
    -- rival_score INTEGER NOT NULL,
    -- start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    -- end_time TIMESTAMP,
    winner_id INTEGER -- can be player_id or rival_id
    -- duration INTERVAL GENERATED ALWAYS AS (end_time - start_time) STORED
);
