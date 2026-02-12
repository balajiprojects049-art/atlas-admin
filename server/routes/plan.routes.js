const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');
const planService = require('../services/plan.service');

// Get all Plans (Public or Auth Required)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const plans = await planService.getAllPlans();
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Plan by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const plan = await planService.getPlanById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
        res.json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create Plan (Admin Only)
router.post('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const plan = await planService.createPlan(req.body);
        res.status(201).json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Plan (Admin Only)
router.put('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const plan = await planService.updatePlan(req.params.id, req.body);
        res.json({ success: true, plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete Plan (Admin Only)
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        await planService.deletePlan(req.params.id);
        res.json({ success: true, message: 'Plan deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
