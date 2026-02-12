const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get settings
router.get('/', authMiddleware, async (req, res) => {
    try {
        let settings = await prisma.settings.findFirst();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    gymName: 'Power Fitness Gym',
                    gstNumber: '29ABCDE1234F1Z5',
                    address: '123 Gym Street, Fitness City, State - 560001',
                    phone: '9876543210',
                    email: 'info@powerfitness.com',
                    emailNotifications: true,
                },
            });
        }

        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update settings
router.put('/', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        // Get existing settings or create if none exist
        let settings = await prisma.settings.findFirst();

        if (!settings) {
            settings = await prisma.settings.create({
                data: req.body,
            });
        } else {
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: req.body,
            });
        }

        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
