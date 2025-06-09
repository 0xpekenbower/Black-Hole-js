CREATE TABLE IF NOT EXISTS ranks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  min_exp INTEGER NOT NULL,
  max_exp INTEGER NOT NULL,
  reward INTEGER NOT NULL,
  icon_path VARCHAR(255) NOT NULL
);


DO $$
  BEGIN
    IF NOT EXISTS(SELECT 1 FROM ranks) THEN
      INSERT INTO ranks (id, name, min_exp, max_exp, reward, icon_path)
      VALUES 
        (1, 'Iron', 0, 999, 1000, 'data/ranks/Iron.png'),
        (2, 'Bronze', 1000, 2500, 2000, 'data/ranks/Bronze.png'),
        (3, 'Silver', 2500, 5000, 3000, 'data/ranks/Silver.png'),
        (4, 'Gold', 5000, 10000, 4000, 'data/ranks/Gold.png'),
        (5, 'Mythic', 10000, 2147483647, 5000, 'data/ranks/Mythic.png');
    END IF;
  END
$$;

