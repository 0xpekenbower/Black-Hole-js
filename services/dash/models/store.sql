CREATE TABLE IF NOT EXISTS backgrounds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL
);

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM backgrounds) THEN
        INSERT INTO backgrounds (id, name, price, image_path)
        VALUES 
        (1, 'Space', 500, 'data/backgrounds/Space.png'),
        (2, 'Forest', 500, 'data/backgrounds/Forest.png'),
        (3, 'Neon', 500, 'data/backgrounds/Neon.png'),
        (4, 'Ocean', 500, 'data/backgrounds/Ocean.png');
        END IF;
    END
$$;



CREATE TABLE IF NOT EXISTS avatars (
  id SERIAL PRIMARY KEY,
  price INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL
);

DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM avatars) THEN
        INSERT INTO avatars (id, price, image_path)
        VALUES 
        (1, 100, 'data/avatars/1.png'),
        (2, 100, 'data/avatars/2.png'),
        (3, 100, 'data/avatars/3.png'),
        (4, 100, 'data/avatars/4.png'),
        (5, 100, 'data/avatars/5.png'),
        (6, 100, 'data/avatars/6.png'),
        (7, 100, 'data/avatars/7.png'),
        (8, 100, 'data/avatars/8.png'),
        (9, 100, 'data/avatars/9.png'),
        (10, 100, 'data/avatars/10.png'),
        (11, 100, 'data/avatars/11.png'),
        (12, 100, 'data/avatars/12.png'),
        (13, 100, 'data/avatars/13.png'),
        (14, 100, 'data/avatars/14.png'),
        (15, 100, 'data/avatars/15.png'),
        (16, 100, 'data/avatars/16.png'),
        (17, 100, 'data/avatars/17.png'),
        (18, 100, 'data/avatars/18.png'),
        (19, 100, 'data/avatars/19.png'),
        (20, 100, 'data/avatars/20.png'),
        (21, 100, 'data/avatars/21.png'),
        (22, 100, 'data/avatars/22.png'),
        (23, 100, 'data/avatars/23.png'),
        (24, 100, 'data/avatars/24.png'),
        (25, 100, 'data/avatars/25.png'),
        (26, 100, 'data/avatars/26.png'),
        (27, 100, 'data/avatars/27.png'),
        (28, 100, 'data/avatars/28.png'),
        (29, 100, 'data/avatars/29.png'),
        (30, 100, 'data/avatars/30.png'),
        (31, 100, 'data/avatars/31.png'),
        (32, 100, 'data/avatars/32.png'),
        (33, 100, 'data/avatars/33.png'),
        (34, 100, 'data/avatars/34.png'),
        (35, 100, 'data/avatars/35.png');
        END IF;
    END
$$;



CREATE TABLE IF NOT EXISTS emotes_packs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  image_path VARCHAR(255) NOT NULL
);


DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM avatars) THEN
        INSERT INTO emotes_packs (id, pack_id, name, price, path)
        VALUES 
        (1, 1, 'Geometry Pack', 500, 'data/emotes/geometry'),
        (2, 2, 'Luna Pack', 500, 'data/emotes/luna'),
        (3, 3, 'Sanrio Pack', 500, 'data/emotes/sanrio');
        END IF;
    END
$$;




CREATE TABLE IF NOT EXISTS inventory (
    user_id INT REFERENCES player(id),
    item_id INT NOT NULL,
    item_type INT NOT NULL,
    CONSTRAINT item_user PRIMARY KEY (user_id, item_id, item_type)
);