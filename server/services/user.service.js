const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

class UserService {
    // Create a new user with hashed password
    async createUser(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        return await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: data.role?.toUpperCase() || 'STAFF',
            },
        });
    }

    // Find user by email
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }

    // Find user by ID
    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    // Compare password
    async comparePassword(candidatePassword, hashedPassword) {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }

    // Get all users
    async getAllUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }

    // Update user
    async updateUser(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        if (data.role) {
            data.role = data.role.toUpperCase();
        }

        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    // Delete user
    async deleteUser(id) {
        return await prisma.user.delete({
            where: { id },
        });
    }
}

module.exports = new UserService();
