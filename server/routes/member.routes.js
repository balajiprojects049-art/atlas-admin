const express = require('express');
const router = express.Router();
const memberService = require('../services/member.service');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all members with pagination and search
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;

        const result = await memberService.getAllMembers({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            status,
        });

        res.json({
            success: true,
            members: result.members,
            totalPages: result.totalPages,
            currentPage: result.page,
            total: result.total,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single member
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const member = await memberService.getMemberById(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create member
router.post('/', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    try {
        const member = await memberService.createMember(req.body);
        res.status(201).json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update member
router.put('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    try {
        const member = await memberService.updateMember(req.params.id, req.body);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete member
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        await memberService.deleteMember(req.params.id);
        res.json({ success: true, message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
