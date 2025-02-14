-- Create the database
CREATE DATABASE IF NOT EXISTS new_database;

-- Use the newly created database
USE new_database;

-- Create a table for products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert sample data into the products table
INSERT INTO products (name, description, price) VALUES
('Honey Farms Honey', 'Yogi Bear is scary', 19.99),
('Ray Liotta Honey', 'Could potentially put you into a rage', 29.99),
('Benson Family Honey', 'I remember when I scared Vanessa, but what did I say when I was practicing it?', 123.00),
('Vanessa Bloome Top !!!!10!!!! Honey', 'beemovie.txt', 19.99);


CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample data into the orders table 
INSERT INTO orders (product_id, quantity, total) VALUES
(1, 2, 39.98),
(2, 1, 29.99),
(3, 10, 119.97);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample data into the reviews table
INSERT INTO reviews (product_id, reviewer, rating, comment) VALUES
(1, 'Adam Flayman', 123, 'This honey was gotten by bad people who hurt seven bees!'),
(2, 'Barry B. Benson', 29, 'Ray Liotta tried to kill me like five times!'),
(3, 'Vanessa Bloome', 1019, 'I like remember when Barry scared me at my three floor apartment... What did he say?');


CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username varchar(255) NOT NULL,
    action TEXT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL
);

