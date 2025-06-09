-- Active: 1746933162460@@127.0.0.1@5999@dashdb
CREATE TABLE IF NOT EXISTS player(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    is_oauth BOOLEAN DEFAULT FALSE,
    is_otp_active BOOLEAN DEFAULT FALSE,
    is_otp_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    level INT DEFAULT 1,
    rank INT DEFAULT 1,
    exp INT DEFAULT 0,
    budget INT DEFAULT 100,
    bio TEXT,
    avatar VARCHAR(120),
    background VARCHAR(120)
);

CREATE TABLE IF NOT EXISTS friends(
    sender INT REFERENCES player(id),
    receiver INT REFERENCES player(id),
    status INT DEFAULT 0,
    CONSTRAINT fr_pkey PRIMARY KEY (sender, receiver)
);

