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

        // Recent transactions (paid or partial)
        const recentTransactions = await prisma.invoice.findMany({
            where: {
                paymentStatus: { in: ['PAID', 'PARTIAL'] },
            },
            include: {
                member: true,
                plan: true,
            },
            orderBy: {
                updatedAt: 'desc',
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

// Export CSV Report
router.get('/export/csv', authMiddleware, async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { paymentStatus: { in: ['PAID', 'PARTIAL'] } },
            include: { member: true, plan: true },
            orderBy: { updatedAt: 'desc' }
        });

        // CSV Header with Detailed Columns
        let csv = 'Invoice Number,Invoice Date,Paid Date,Member ID,Member Name,Member Email,Member Phone,Plan,Base Amount,CGST,SGST,Total Tax,Total Amount,Paid Amount,Due Amount,Status,Payment Method,Transaction ID\n';

        // Financial Totals
        let totalBase = 0;
        let totalTaxAmount = 0;
        let totalGrand = 0;
        let totalPaid = 0;
        let totalDue = 0;

        // CSV Rows
        invoices.forEach(inv => {
            const invoiceDate = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '';
            const paidDate = inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : '';

            const memberName = inv.member?.name || 'N/A';
            const memberEmail = inv.member?.email || 'N/A';
            const memberPhone = inv.member?.phone || 'N/A';
            const planName = inv.plan?.name || 'N/A';

            // Financials
            const base = inv.amount || 0;
            const cgst = inv.cgst || 0;
            const sgst = inv.sgst || 0;
            const tax = inv.gstAmount || 0;
            const total = inv.totalAmount || 0;
            const paid = inv.paidAmount || 0;
            const due = total - paid;

            // Accumulate Totals
            totalBase += base;
            totalTaxAmount += tax;
            totalGrand += total;
            totalPaid += paid;
            totalDue += due;

            const txnId = inv.razorpayPaymentId || 'N/A';

            csv += `${inv.invoiceNumber},${invoiceDate},${paidDate},"${inv.member?.memberId || 'N/A'}",${memberName},${memberEmail},${memberPhone},"${planName}",${base.toFixed(2)},${cgst.toFixed(2)},${sgst.toFixed(2)},${tax.toFixed(2)},${total.toFixed(2)},${paid.toFixed(2)},${due.toFixed(2)},${inv.paymentStatus},${inv.paymentMethod || 'N/A'},${txnId}\n`;
        });

        // Add Summary Total Row (empty columns for IDs and names)
        csv += `TOTALS,,,,,,,,${totalBase.toFixed(2)},,,${totalTaxAmount.toFixed(2)},${totalGrand.toFixed(2)},${totalPaid.toFixed(2)},${totalDue.toFixed(2)},,,\n`;

        res.header('Content-Type', 'text/csv');
        res.attachment('Detailed_Revenue_Report.csv');
        res.send(csv);

    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ success: false, message: 'Failed to export CSV' });
    }
});

// Export PDF Report (Landscape for more details)
const PDFDocument = require('pdfkit');

router.get('/export/pdf', authMiddleware, async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({
            where: { paymentStatus: { in: ['PAID', 'PARTIAL'] } },
            include: { member: true, plan: true },
            orderBy: { updatedAt: 'desc' }
        });

        // Create Landscape PDF
        const doc = new PDFDocument({ margin: 30, layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Detailed_Revenue_Report.pdf');

        doc.pipe(res);

        // Title
        // Title
        doc.fontSize(16).text('Atlas Fitness Elite', { align: 'center' });
        doc.fontSize(10).text('3-4-98/4/204, New Narsina Nagar, Mallapur, Hyderabad, Telangana 500076', { align: 'center' });
        doc.text('+91 99882 29441, +91 83175 29757', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(20).text('Detailed Revenue Report', { align: 'center' });
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();

        // Table Constants
        const tableTop = 100;
        const col1 = 30;  // Invoice #
        const col2 = 100; // Date
        const col3 = 170; // Member ID
        const col4 = 240; // Member Name
        const col5 = 350; // Plan
        const col6 = 430; // Base Amt
        const col7 = 490; // Tax
        const col8 = 540; // Total
        const col9 = 610; // Paid
        const col10 = 680; // Due
        const col11 = 730; // Method

        // Draw Table Header
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Invoice #', col1, tableTop);
        doc.text('Date', col2, tableTop);
        doc.text('Member ID', col3, tableTop);
        doc.text('Member Name', col4, tableTop);
        doc.text('Plan', col5, tableTop);
        doc.text('Base', col6, tableTop);
        doc.text('Tax', col7, tableTop);
        doc.text('Total', col8, tableTop);
        doc.text('Paid', col9, tableTop);
        doc.text('Due', col10, tableTop);
        doc.text('Method', col11, tableTop);

        doc.moveTo(30, tableTop + 15).lineTo(770, tableTop + 15).stroke();

        let yPosition = tableTop + 25;

        doc.font('Helvetica').fontSize(9);

        let totalBase = 0;
        let totalTaxAmount = 0;
        let totalGrand = 0;
        let totalPaid = 0;
        let totalDue = 0;

        invoices.forEach(inv => {
            if (yPosition > 550) {
                doc.addPage({ layout: 'landscape', margin: 30 });
                yPosition = 50;

                // Re-draw header on new page
                doc.font('Helvetica-Bold');
                doc.text('Invoice #', col1, yPosition);
                doc.text('Date', col2, yPosition);
                doc.text('Member ID', col3, yPosition);
                doc.text('Member Name', col4, yPosition);
                doc.text('Plan', col5, yPosition);
                doc.text('Base', col6, yPosition);
                doc.text('Tax', col7, yPosition);
                doc.text('Total', col8, yPosition);
                doc.text('Paid', col9, yPosition);
                doc.text('Due', col10, yPosition);
                doc.text('Method', col11, yPosition);
                doc.moveTo(30, yPosition + 15).lineTo(770, yPosition + 15).stroke();
                yPosition += 25;
                doc.font('Helvetica');
            }

            const date = inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : (inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : '');

            const base = inv.amount || 0;
            const tax = inv.gstAmount || 0;
            const total = inv.totalAmount || 0;
            const paid = inv.paidAmount || 0;
            const due = total - paid;

            // Accumulate Totals
            totalBase += base;
            totalTaxAmount += tax;
            totalGrand += total;
            totalPaid += paid;
            totalDue += due;

            const planName = inv.plan?.name ? inv.plan.name.substring(0, 15) : 'N/A';

            doc.text(inv.invoiceNumber, col1, yPosition);
            doc.text(date, col2, yPosition);
            doc.text(inv.member?.memberId || 'N/A', col3, yPosition);
            doc.text(inv.member?.name?.substring(0, 18) || 'N/A', col4, yPosition);
            doc.text(planName, col5, yPosition);
            doc.text(base.toFixed(2), col6, yPosition);
            doc.text(tax.toFixed(2), col7, yPosition);
            doc.text(total.toFixed(2), col8, yPosition);
            doc.text(paid.toFixed(2), col9, yPosition);
            doc.text(due.toFixed(2), col10, yPosition);
            doc.text(inv.paymentMethod || 'N/A', col11, yPosition);

            yPosition += 20;
        });

        // Draw Summary Total Row
        doc.moveTo(30, yPosition).lineTo(770, yPosition).stroke();
        yPosition += 10;
        doc.font('Helvetica-Bold');
        doc.text('TOTALS', col1, yPosition);
        doc.text(totalBase.toFixed(2), col6, yPosition);
        doc.text(totalTaxAmount.toFixed(2), col7, yPosition);
        doc.text(totalGrand.toFixed(2), col8, yPosition);
        doc.text(totalPaid.toFixed(2), col9, yPosition);
        doc.text(totalDue.toFixed(2), col10, yPosition);

        doc.end();

    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ success: false, message: 'Failed to export PDF' });
    }
});

module.exports = router;
