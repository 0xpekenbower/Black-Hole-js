CREATE TABLE IF NOT EXISTS connected_users (
    user_id             TEXT PRIMARY KEY,
    state               TEXT NOT NULL DEFAULT 'offline' CHECK (
                            state IN ('offline', 'lobby', 'queued', 'playing', 'disconnected', 'spectating')
                        ),
    last_connection     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_disconnection  TIMESTAMP,
    current_room_id     TEXT,
    score               INTEGER DEFAULT 0,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);