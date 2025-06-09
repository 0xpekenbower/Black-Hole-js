CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  coin_reward INTEGER NOT NULL,
  parts INTEGER NOT NULL,
  icon_path VARCHAR(255) DEFAULT NULL
);


DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM achievements) THEN
      INSERT INTO achievements (id, title, description, coin_reward, parts,icon_path)
      VALUES 
        (1, 'FirstPaddle', 'Launch and serve in your very first match', 1000, 1, 'FirstPaddle'),
        (2, 'FriendlyCircleI', 'Add your very first friend to your friend list.', 1000, 1, 'FriendlyCircleI'),
        (3, 'FriendlyCircleII', 'Add 3 friends to your friend list.', 2000, 3, 'FriendlyCircleII'),
        (4, 'ChatStarter', 'Send your first message to any friend in the in-game', 1000, 1, 'ChatStarter'),
        (5, 'RisingStarI', 'Win your first ping-pong match.', 2000, 1, 'RisingStarI'),
        (6, 'RisingStarII', 'Win 3 ping-pong matches.', 3000, 3, 'RisingStarII'),
        (8, 'SocialStar', 'Chat with two or more friends.', 5000, 2, 'SocialStar'),
        (9, 'TournamentChampionI', 'Win your first tournament.', 5000, 1, 'TournamentChampionI'),
        (10, 'TournamentChampionII', 'Win 3 tournaments.', 6000, 3, 'TournamentChampionII'),
        (11, 'TournamentChampionIII', 'Win 5 tournaments.', 8000, 5, 'TournamentChampionIII'),
        (12, 'PingPongLegend', 'Win 10 ping-pong matches.', 10000, 10, 'PingPongLegend');
    END IF;
  END
$$;

CREATE TABLE IF NOT EXISTS user_achiev(
  user_id INT REFERENCES player(id),
  achievement_id INT REFERENCES achievements(id),
  parts INT DEFAULT 1,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP DEFAULT NULL,
  CONSTRAINT pk_Uachiev PRIMARY KEY (user_id, achievement_id)
);

