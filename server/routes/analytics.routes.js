const express = require('express');
const router = express.Router();
const memberService = require('../services/member.service');
const invoiceService = require('../services/invoice.service');
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../config/db');

// Get dashboard statistics
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        // Total Revenue
        const totalRevenue = await invoiceService.getTotalRevenue();

        // Active Members
        const activeMembers = await memberService.getActiveMembersCount();

        // Today's Collections
        const todayCollections = await invoiceService.getTodayCollections();

        // Overdue Payments
        const overdueInvoices = await invoiceService.getOverdueInvoices();

        // Recent transactions (last 10 paid invoices)
        const recentTransactions = await prisma.invoice.findMany({
            where: {
                paymentStatus: 'PAID',
            },
            include: {
                member: true,
                plan: true,
            },
            orderBy: {
                paidDate: 'desc',
            },
            take: 10,
        });

        res.json({
            success: true,
            stats: {
                totalRevenue,
                activeMembers,
                todayCollections,
                overduePayments: overdueInvoices.length,
                recentTransactions,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get revenue data
router.get('/revenue', authMiddleware, async (req, res) => {
    try {
        // Get revenue grouped by month using raw SQL for better performance
        const revenue = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "paidDate") as year,
        EXTRACT(MONTH FROM "paidDate") as month,
        SUM("totalAmount") as total
      FROM invoices
      WHERE "paymentStatus" = 'PAID'
      GROUP BY year, month
      ORDER BY year, month
    `;

        res.json({ success: true, revenue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get membership growth data
router.get('/members', authMiddleware, async (req, res) => {
    try {
        // Get member growth grouped by month
        const members = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year,
        EXTRACT(MONTH FROM "createdAt") as month,
        COUNT(*) as count
      FROM members
      GROUP BY year, month
      ORDER BY year, month
    `;

        res.json({ success: true, members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
