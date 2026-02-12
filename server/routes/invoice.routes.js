const express = require('express');
const router = express.Router();
const invoiceService = require('../services/invoice.service');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Get all invoices
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '', memberId = '' } = req.query;

        const result = await invoiceService.getAllInvoices({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            memberId,
        });

        res.json({
            success: true,
            invoices: result.invoices,
            totalPages: result.totalPages,
            currentPage: result.page,
            total: result.total,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single invoice
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create invoice
router.post('/', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    try {
        const invoice = await invoiceService.createInvoice(req.body);
        res.status(201).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update invoice
router.put('/:id', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    try {
        const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete invoice
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        await invoiceService.deleteInvoice(req.params.id);
        res.json({ success: false, message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
