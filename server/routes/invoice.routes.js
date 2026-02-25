const express = require('express');
const router = express.Router();
const invoiceService = require('../services/invoice.service');
const emailService = require('../services/email.service');
const { generateInvoicePDF } = require('../services/pdf.service');
const prisma = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Download Invoice PDF
router.get('/:id/download', authMiddleware, async (req, res) => {
    let headersSent = false;
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        console.log('📄 Generating PDF for invoice:', invoice.invoiceNumber);
        console.log('📄 Member data:', JSON.stringify(invoice.member));

        const pdfBuffer = await generateInvoicePDF(invoice);

        if (!pdfBuffer || pdfBuffer.length < 100) {
            throw new Error('PDF buffer is empty or too small');
        }

        console.log('✅ PDF generated, size:', pdfBuffer.length, 'bytes');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);
        headersSent = true;
        res.end(pdfBuffer);

    } catch (error) {
        console.error('❌ PDF Generation Error:', error.message);
        console.error(error.stack);
        if (!headersSent) {
            res.status(500).json({ success: false, message: `Failed to generate PDF: ${error.message}` });
        }
    }
});

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
