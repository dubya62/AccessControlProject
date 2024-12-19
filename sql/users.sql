CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES(
    "user",
    "$2a$12$wICQ28K5zjp6HBGrHA7r9.vNMeNylY9TGcOX2nJxa7yivndwydWra",
    --"pass",
    "3eb7",
    "user@example.com"
);
