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

-- Tạo index cho performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_otp ON users(otpCode, otpExpiresAt);
CREATE INDEX idx_users_email_verified ON users(isEmailVerified);
