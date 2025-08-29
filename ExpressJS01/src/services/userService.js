const User = require('../models/user');
const jwt = require('jsonwebtoken');

class UserService {
    // Create new user
    async createUser(userData) {
        try {
            const user = await User.create(userData);
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Find user by email
    async findByEmail(email) {
        try {
            return await User.findOne({ where: { email } });
        } catch (error) {
            throw error;
        }
    }

    // Find user by username
    async findByUsername(username) {
        try {
            return await User.findOne({ where: { username } });
        } catch (error) {
            throw error;
        }
    }

    // Find user by ID
    async findById(id) {
        try {
            return await User.findByPk(id);
        } catch (error) {
            throw error;
        }
    }

    // Generate JWT token
    generateToken(user) {
        return jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw error;
        }
    }

    // Get all users (admin only)
    async getAllUsers() {
        try {
            return await User.findAll({
                attributes: { exclude: ['password'] }
            });
        } catch (error) {
            throw error;
        }
    }

    // Update user
    async updateUser(id, updateData) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User not found');
            }
            await user.update(updateData);
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Delete user
    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User not found');
            }
            await user.destroy();
            return user;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();
