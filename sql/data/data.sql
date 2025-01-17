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

