CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  min_exp INTEGER NOT NULL,
  max_exp INTEGER NOT NULL,
  reward INTEGER NOT NULL
);

DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM levels) THEN
      INSERT INTO levels (id, min_exp, max_exp, reward)
      VALUES 
        (1, 0, 99, 100),
        (2, 100, 299, 100),
        (3, 300, 599, 100),
        (4, 600, 999, 100),
        (5, 1000, 1499, 100),
        (6, 1500, 1999, 100),
        (7, 2000, 2599, 100),
        (8, 2600, 3299, 100),
        (9, 3300, 3999, 100),
        (10, 4000, 4999, 200),
        (11, 5000, 5999, 200),
        (12, 6000, 6999, 200),
        (13, 7000, 8499, 200),
        (14, 8500, 9999, 200),
        (15, 10000, 11999, 200),
        (16, 12000, 13999, 300),
        (17, 14000, 16499, 300),
        (18, 16500, 18999, 300),
        (19, 19000, 21999, 300),
        (20, 22000, 29999, 400);
    END IF;
  END
$$;
