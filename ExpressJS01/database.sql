-- Tạo database
CREATE DATABASE IF NOT EXISTS fullstack_nodejs;
USE fullstack_nodejs;

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    isActive BOOLEAN DEFAULT true,
    -- OTP fields
    otpCode VARCHAR(6) NULL,
    otpExpiresAt TIMESTAMP NULL,
    isEmailVerified BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    categoryId INT NOT NULL,
    imageUrl VARCHAR(500),
    stock INT DEFAULT 0,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tạo index cho performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_otp ON users(otpCode, otpExpiresAt);
CREATE INDEX idx_users_email_verified ON users(isEmailVerified);

-- Index cho categories
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_active ON categories(isActive);

-- Index cho products
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(isActive);
CREATE INDEX idx_products_stock ON products(stock);








