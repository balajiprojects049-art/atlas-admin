const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const invoiceService = require('../services/invoice.service');
const { authMiddleware } = require('../middleware/auth');

// Initialize Razorpay (will use env variables)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
});

// Create Razorpay order
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await invoiceService.getInvoiceById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const options = {
            amount: invoice.totalAmount * 100, // amount in paise
            currency: 'INR',
            receipt: invoice.invoiceNumber,
        };

        const order = await razorpay.orders.create(options);

        // Save order ID to invoice
        await invoiceService.updateInvoice(invoiceId, {
            razorpayOrderId: order.id,
        });

        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Verify Razorpay payment
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Payment verified, update invoice
            const invoice = await invoiceService.markAsPaid(invoiceId, {
                razorpayPaymentId: razorpay_payment_id,
                paymentMethod: 'Online',
            });

            res.json({
                success: true,
                message: 'Payment verified successfully',
                invoice,
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get payment history for a member
router.get('/history/:memberId', authMiddleware, async (req, res) => {
    try {
        const result = await invoiceService.getAllInvoices({
            memberId: req.params.memberId,
            status: 'paid',
            page: 1,
            limit: 100,
        });

        res.json({ success: true, invoices: result.invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
