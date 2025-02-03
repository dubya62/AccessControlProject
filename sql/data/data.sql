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
('Product 1', 'Description for product 1', 19.99),
('Product 2', 'Description for product 2', 29.99),
('Product 3', 'Description for product 3', 39.99);


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
(3, 3, 119.97);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample data into the reviews table
INSERT INTO reviews (product_id, rating, comment) VALUES
(1, 5, 'Great product!'),
(2, 4, 'Good product, but could be better.'),
(3, 3, 'Average product.');


CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username varchar(255) NOT NULL,
    action TEXT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL
);

