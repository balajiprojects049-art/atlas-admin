const prisma = require('../config/db');
const emailService = require('./email.service');

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
        // Extract fields that are not in the Invoice schema but used for calculation
        const { gstRate: inputGstRate, ...invoiceData } = data;

        const invoiceNumber = await this.generateInvoiceNumber();

        // Calculate GST amounts
        const gstRate = inputGstRate || 18;
        const gstAmount = (data.amount * gstRate) / 100;
        const cgst = gstAmount / 2;
        const sgst = gstAmount / 2;
        const totalAmount = data.amount + gstAmount + (data.lateFee || 0);

        const newInvoice = await prisma.invoice.create({
            data: {
                ...invoiceData,
                invoiceNumber,
                gstAmount,
                cgst,
                sgst,
                totalAmount,
                paidAmount: data.paidAmount || 0,
                paymentStatus: data.paymentStatus?.toUpperCase() || 'PENDING',
            },
            include: {
                member: true,
                plan: true,
            },
        });

        // If created as PAID immediately, trigger renewal and send email
        if (newInvoice.paymentStatus === 'PAID') {
            await this.handleMembershipRenewal(newInvoice.memberId, newInvoice.planId);

            if (newInvoice.member?.email) {
                console.log(`📧 Invoice ${newInvoice.invoiceNumber} created as PAID. Sending receipt to ${newInvoice.member.email}`);
                try {
                    await emailService.sendInvoiceEmail(newInvoice);
                } catch (err) {
                    console.error('Invoice email error:', err);
                }
            }
        }

        return newInvoice;
    }

    // Helper to renew membership based on plan duration
    async handleMembershipRenewal(memberId, planId) {
        try {
            const member = await prisma.member.findUnique({ where: { id: memberId } });
            const plan = await prisma.plan.findUnique({ where: { id: planId } });

            if (!member || !plan || !plan.duration) return;

            const today = new Date();
            let newStartDate = new Date();
            let newEndDate = new Date();

            // Check if member is currently active and not expired
            if (member.planEndDate && new Date(member.planEndDate) > today) {
                // Extend existing plan
                newStartDate = new Date(member.planStartDate); //Keep original start
                const currentEnd = new Date(member.planEndDate);
                currentEnd.setMonth(currentEnd.getMonth() + plan.duration);
                newEndDate = currentEnd;
                console.log(`🔄 Extending membership for ${member.name}. New End Date: ${newEndDate.toISOString()}`);
            } else {
                // Expired or new: Start fresh from today
                newStartDate = today;
                const end = new Date(today);
                end.setMonth(today.getMonth() + plan.duration);
                newEndDate = end;
                console.log(`🆕 Renewing expired membership for ${member.name}. New End Date: ${newEndDate.toISOString()}`);
            }

            await prisma.member.update({
                where: { id: memberId },
                data: {
                    planId: planId,
                    planStartDate: newStartDate,
                    planEndDate: newEndDate,
                    status: 'ACTIVE'
                }
            });

        } catch (error) {
            console.error('❌ Error renewing membership:', error);
        }
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
        const {
            gstRate: inputGstRate,
            discount,
            discountType,
            paidAmount,
            notes,
            trainerName,
            ...otherData
        } = data;

        const updateData = { ...otherData };

        if (updateData.paymentStatus) {
            updateData.paymentStatus = updateData.paymentStatus.toUpperCase();
        }

        // Recalculate totals if amount changes
        if (updateData.amount || updateData.amount === 0) {
            const gstRate = inputGstRate || 18;
            const gstAmount = (updateData.amount * gstRate) / 100;
            updateData.cgst = gstAmount / 2;
            updateData.sgst = gstAmount / 2;
            updateData.gstAmount = gstAmount;
            updateData.totalAmount = updateData.amount + gstAmount + (updateData.lateFee || 0);
        }

        // Only keep fields that exist in the Prisma schema to avoid errors
        const validFields = [
            'amount', 'gstAmount', 'cgst', 'sgst', 'lateFee', 'totalAmount',
            'paidAmount', 'paymentStatus', 'dueDate', 'paidDate', 'razorpayOrderId',
            'razorpayPaymentId', 'paymentMethod'
        ];

        const prismaData = {};
        validFields.forEach(field => {
            if (updateData[field] !== undefined) {
                prismaData[field] = updateData[field];
            }
        });

        const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: prismaData,
            include: {
                member: true,
                plan: true,
            },
        });

        // If updated to PAID, trigger renewal and send email
        if (updatedInvoice.paymentStatus === 'PAID') {
            await this.handleMembershipRenewal(updatedInvoice.memberId, updatedInvoice.planId);

            if (updatedInvoice.member?.email) {
                console.log(`📧 Invoice ${updatedInvoice.invoiceNumber} paid. Sending receipt to ${updatedInvoice.member.email}`);
                try {
                    await emailService.sendInvoiceEmail(updatedInvoice);
                } catch (err) {
                    console.error('Invoice email error:', err);
                }
            }
        }

        return updatedInvoice;
    }

    // Delete invoice
    async deleteInvoice(id) {
        return await prisma.invoice.delete({
            where: { id },
        });
    }

    // Mark invoice as paid
    async markAsPaid(id, paymentDetails) {
        const invoice = await prisma.invoice.findUnique({ where: { id } });
        if (!invoice) return null;

        const paidInvoice = await prisma.invoice.update({
            where: { id },
            data: {
                paymentStatus: 'PAID',
                paidDate: new Date(),
                paidAmount: invoice.totalAmount, // Ensure full amount is recorded
                ...paymentDetails,
            },
            include: {
                member: true,
                plan: true,
            },
        });

        // Trigger renewal
        await this.handleMembershipRenewal(paidInvoice.memberId, paidInvoice.planId);

        // Send Payment Receipt Email
        if (paidInvoice.member?.email) {
            console.log(`📧 Invoice ${paidInvoice.invoiceNumber} marked paid. Sending receipt to ${paidInvoice.member.email}`);
            try {
                await emailService.sendInvoiceEmail(paidInvoice);
            } catch (err) {
                console.error('Invoice email error:', err);
            }
        }

        return paidInvoice;
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
            _sum: {
                paidAmount: true,
            },
        });
        return result._sum.paidAmount || 0;
    }

    // Get today's collections
    async getTodayCollections() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = await prisma.invoice.aggregate({
            where: {
                updatedAt: { // Using updatedAt as paidDate might be null for partial
                    gte: today,
                    lt: tomorrow,
                },
            },
            _sum: {
                paidAmount: true,
            },
        });

        return result._sum.paidAmount || 0;
    }
}

module.exports = new InvoiceService();
