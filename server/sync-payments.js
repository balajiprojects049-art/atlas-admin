const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Syncing paidAmount for existing invoices...');
    const invoices = await prisma.invoice.findMany({
        where: {
            OR: [
                { paymentStatus: 'PAID' },
                { paidAmount: 0 }
            ]
        }
    });

    for (const invoice of invoices) {
        if (invoice.paymentStatus === 'PAID') {
            await prisma.invoice.update({
                where: { id: invoice.id },
                data: { paidAmount: invoice.totalAmount }
            });
            console.log(`Updated PAID invoice ${invoice.invoiceNumber}`);
        } else if (invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount === 0) {
            // Maybe some partials were created without paidAmount?
            // For now just logging
            console.log(`PARTIAL invoice ${invoice.invoiceNumber} has 0 paidAmount`);
        }
    }
    console.log('Sync complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
