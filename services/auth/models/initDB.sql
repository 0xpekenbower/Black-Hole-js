CREATE TABLE IF NOT EXISTS account(
    id SERIAL PRIMARY KEY,
    username VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(60) UNIQUE NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    password TEXT NOT NULL,
    is_oauth BOOLEAN DEFAULT FALSE,
    is_otp BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(120)
);


CREATE TABLE IF NOT EXISTS change_pass(
    id SERIAL PRIMARY KEY,
    email VARCHAR(60) REFERENCES account(email),
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS twofa(
    id SERIAL REFERENCES account(id),
    otp_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- INSERT INTO account(username, email, password) 
--             VALUES(buddha, buddha@hotmail.com, $2b$10$trWPY854fHa9lAb0Vcic3uQTzqHmZFp2O1XeK6B5IX56FZ5I6giNK);' ) 


-- SELECT EXISTS (SELECT 1 FROM change_pass
--             WHERE otp_code = '125486' AND created_at < NOW() - INTERVAL '10 minutes')