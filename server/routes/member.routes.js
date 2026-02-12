const express = require('express');
const router = express.Router();
const multer = require('multer');
const memberService = require('../services/member.service');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Multer Configuration (Memory Storage for Vercel compatibility)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
});

// Helper to process member data
const processMemberData = (body, file) => {
    const data = { ...body };

    // Convert numeric fields from string to number
    // REMOVED 'weight' and 'height' because Prisma Schema defines them as String
    const numericFields = ['planAmount', 'planDuration', 'price'];
    numericFields.forEach(field => {
        if (data[field]) {
            // Remove non-numeric characters (like 'kg', 'cm') except dot
            const cleaned = data[field].toString().replace(/[^0-9.]/g, '');
            const num = parseFloat(cleaned);
            if (!isNaN(num)) {
                data[field] = num;
            } else {
                delete data[field]; // Remove if invalid number
            }
        }
    });

    // Handle Photo (Convert to Base64 for Vercel/DB storage)
    // Note: In a real production app, use S3/Cloudinary. This is a Vercel workaround.
    if (file) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const mimeType = file.mimetype;
        data.photo = `data:${mimeType};base64,${b64}`;
    }

    return data;
};

// Get all members
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
            ...result
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single member
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const member = await memberService.getMemberById(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create member
router.post('/', authMiddleware, requireRole('admin', 'staff'), upload.single('photo'), async (req, res) => {
    try {
        console.log('Creating member payload:', req.body);
        const data = processMemberData(req.body, req.file);

        // Clean up 'photo' if it came as empty object body param
        if (data.photo && typeof data.photo === 'object') {
            delete data.photo;
        }

        const member = await memberService.createMember(data);
        res.status(201).json({ success: true, member });
    } catch (error) {
        console.error('Create member error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update member
router.put('/:id', authMiddleware, requireRole('admin', 'staff'), upload.single('photo'), async (req, res) => {
    try {
        const data = processMemberData(req.body, req.file);

        // Clean up 'photo' if it came as empty object body param
        if (data.photo && typeof data.photo === 'object') {
            delete data.photo;
        }

        const member = await memberService.updateMember(req.params.id, data);
        if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
        res.json({ success: true, member });
    } catch (error) {
        console.error('Update member error:', error);
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
