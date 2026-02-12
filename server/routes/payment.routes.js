const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const invoiceService = require('../services/invoice.service');
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../config/db');

// Helper to get Razorpay instance and keys
const getRazorpayConfig = async () => {
    // 1. Try DB Settings
    const settings = await prisma.settings.findFirst();
    if (settings && settings.razorpayKeyId && settings.razorpayKeySecret) {
        return {
            key_id: settings.razorpayKeyId,
            key_secret: settings.razorpayKeySecret,
            instance: new Razorpay({
                key_id: settings.razorpayKeyId,
                key_secret: settings.razorpayKeySecret,
            })
        };
    }

    // 2. Try Environment Variables
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        return {
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
            instance: new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            })
        };
    }

    throw new Error('Razorpay keys not configured in Settings or Environment Variables');
};

// Create Razorpay order
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await invoiceService.getInvoiceById(invoiceId);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const { instance, key_id } = await getRazorpayConfig();

        const options = {
            amount: Math.round(invoice.totalAmount * 100), // amount in paise
            currency: 'INR',
            receipt: invoice.invoiceNumber,
            payment_capture: 1 // Auto capture
        };

        const order = await instance.orders.create(options);

        // Save order ID to invoice
        await invoiceService.updateInvoice(invoiceId, {
            razorpayOrderId: order.id,
        });

        res.json({
            success: true,
            order,
            key: key_id,
        });
    } catch (error) {
        console.error('Razorpay Create Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Payment initiation failed' });
    }
});

// Verify Razorpay payment
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;

        const { key_secret } = await getRazorpayConfig();

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', key_secret)
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
        console.error('Razorpay Verify Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
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
