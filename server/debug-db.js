const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const members = await prisma.member.findMany({
        include: { plan: true }
    });
    console.log('--- Total Members in DB: ' + members.length + ' ---');
    members.forEach(m => {
        console.log(`ID: ${m.id}, MemberID: ${m.memberId}, Name: ${m.name}, Status: ${m.status}`);
    });

    const invoices = await prisma.invoice.findMany();
    console.log('--- Total Invoices in DB: ' + invoices.length + ' ---');
    invoices.forEach(inv => {
        console.log(`INV: ${inv.invoiceNumber}, Total: ${inv.totalAmount}, Paid: ${inv.paidAmount}, Status: ${inv.paymentStatus}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
