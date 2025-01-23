CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    salt    VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);
-- "pass",

INSERT INTO users (username, password, role, salt, email) VALUES (
    'user',
    '$2a$12$wICQ28K5zjp6HBGrHA7r9.vNMeNylY9TGcOX2nJxa7yivndwydWra',
    'user',
    '3eb7',
    'user@example.com'
);
INSERT INTO users (username, password, salt, email) VALUES (
    'user2',
    '',
    'admin',
    '7dz2',
    'user2@example.com'
);

