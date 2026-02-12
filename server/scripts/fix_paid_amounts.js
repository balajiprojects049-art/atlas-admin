const prisma = require('../config/db');

async function fixPaidAmounts() {
    console.log('🔄 Starting fix for PAID invoices with 0 paidAmount...');

    try {
        // Find all invoices that are PAID but have 0 paidAmount
        const invoices = await prisma.invoice.findMany({
            where: {
                paymentStatus: 'PAID',
                paidAmount: 0 // or maybe just less than totalAmount? Safe to assume 0 is the main bug.
            }
        });

        console.log(`Found ${invoices.length} invoices to update.`);

        for (const invoice of invoices) {
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: {
                    paidAmount: invoice.totalAmount
                }
            });
            console.log(`✅ Updated Invoice ${invoice.invoiceNumber}: Set paidAmount to ${invoice.totalAmount}`);
        }

        console.log('🎉 Fix completed successfully.');
    } catch (error) {
        console.error('❌ Error updating invoices:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixPaidAmounts()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
