CREATE TABLE IF NOT EXISTS notifs (
  id SERIAL PRIMARY KEY,
  sender INT REFERENCES player(id),
  receiver INT REFERENCES player(id),
  notif_type INTEGER NOT NULL,
  is_readen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);