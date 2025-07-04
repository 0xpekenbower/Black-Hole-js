-- Active: 1746933162460@@127.0.0.1@5999@chatdb
CREATE TABLE IF NOT EXISTS chatter(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    is_online BOOLEAN DEFAULT FALSE, -- how to ?
    avatar VARCHAR(120),
    background VARCHAR(120) -- i think no need
);

-- CREATE TABLE IF NOT EXISTS conversation(
--     id SERIAL PRIMARY KEY,
--     user1 INT REFERENCES chatter(id),
--     user2 INT REFERENCES chatter(id),
--     last_msg TEXT NOT NULL,
--     sender INT REFERENCES chatter(id),
--     created_at TIMESTAMP DEFAULT NOW()
-- );

CREATE TABLE IF NOT EXISTS msg(
    -- id SERIAL PRIMARY KEY,
    user1 INT REFERENCES chatter(id),
    user2 INT REFERENCES chatter(id),
    sender INT REFERENCES chatter(id),
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- WITH conv AS (SELECT *, GREATEST(user1, user2) AS u1, LEAST(user1, user2) AS u2 FROM msg WHERE user1 = 9 OR user2 = 9),
-- last_msg AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY u1, u2 ORDER BY created_at DESC) FROM conv)  SELECT * FROM last_msg WHERE row_number = 1;