const prisma = require('../config/db');

class InvoiceService {
    // Generate unique invoice number (INV-YYYY-NNNN format)
    async generateInvoiceNumber() {
        const currentYear = new Date().getFullYear();
        const yearPrefix = `INV-${currentYear}`;

        const lastInvoice = await prisma.invoice.findFirst({
            where: {
                invoiceNumber: {
                    startsWith: yearPrefix,
                },
            },
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        });

        if (!lastInvoice) {
            return `${yearPrefix}-0001`;
        }

        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
        const newNumber = (lastNumber + 1).toString().padStart(4, '0');
        return `${yearPrefix}-${newNumber}`;
    }

    // Create a new invoice
    async createInvoice(data) {
        const invoiceNumber = await this.generateInvoiceNumber();

        // Calculate GST amounts
        const gstRate = data.gstRate || 18;
        const gstAmount = (data.amount * gstRate) / 100;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const totalAmount = data.amount + gstAmount + (data.lateFee || 0);

        return await prisma.invoice.create({
            data: {
                ...data,
                invoiceNumber,
                gstAmount,
                cgst,
                sgst,
                totalAmount,
                paymentStatus: data.paymentStatus?.toUpperCase() || 'PENDING',
            },
            include: {
                member: true,
                plan: true,
            },
        });
    }

    // Get all invoices with pagination and filters
    async getAllInvoices({ page = 1, limit = 10, status = '', memberId = '' }) {
        const skip = (page - 1) * limit;

        const where = {
            ...(status && { paymentStatus: status.toUpperCase() }),
            ...(memberId && { memberId }),
        };

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    member: true,
                    plan: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.invoice.count({ where }),
        ]);

        return {
            invoices,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Get invoice by ID
    async getInvoiceById(id) {
        return await prisma.invoice.findUnique({
            where: { id },
            include: {
                member: true,
                plan: true,
            },
        });
    }

    // Update invoice
    async updateInvoice(id, data) {
        if (data.paymentStatus) {
            data.paymentStatus = data.paymentStatus.toUpperCase();
        }

        // Recalculate totals if amount changes
        if (data.amount) {
            const gstRate = data.gstRate || 18;
            const gstAmount = (data.amount * gstRate) / 100;
            data.cgst = gstAmount / 2;
            data.sgst = gstAmount / 2;
            data.gstAmount = gstAmount;
            data.totalAmount = data.amount + gstAmount + (data.lateFee || 0);
        }

        return await prisma.invoice.update({
            where: { id },
            data,
            include: {
                member: true,
                plan: true,
            },
        });
    }

    // Delete invoice
    async deleteInvoice(id) {
        return await prisma.invoice.delete({
            where: { id },
        });
    }

    // Mark invoice as paid
    async markAsPaid(id, paymentDetails) {
        return await prisma.invoice.update({
            where: { id },
            data: {
                paymentStatus: 'PAID',
                paidDate: new Date(),
                ...paymentDetails,
            },
            include: {
                member: true,
                plan: true,
            },
        });
    }

    // Get overdue invoices
    async getOverdueInvoices() {
        return await prisma.invoice.findMany({
            where: {
                paymentStatus: { in: ['PENDING', 'OVERDUE'] },
                dueDate: {
                    lt: new Date(),
                },
            },
            include: {
                member: true,
                plan: true,
            },
        });
    }

    // Get total revenue
    async getTotalRevenue() {
        const result = await prisma.invoice.aggregate({
            where: {
                paymentStatus: 'PAID',
            },
            _sum: {
                totalAmount: true,
            },
        });

        return result._sum.totalAmount || 0;
    }

    // Get today's collections
    async getTodayCollections() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = await prisma.invoice.aggregate({
            where: {
                paymentStatus: 'PAID',
                paidDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            _sum: {
                totalAmount: true,
            },
        });

        return result._sum.totalAmount || 0;
    }
}

module.exports = new InvoiceService();
