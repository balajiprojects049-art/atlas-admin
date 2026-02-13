const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Custom Plan...');

    const customPlan = await prisma.plan.upsert({
        where: { id: 'custom-plan-id' }, // Use a fixed ID to easily reference it if needed
        update: {},
        create: {
            id: 'custom-plan-id', // Optional: fix the ID
            name: 'Custom Plan',
            duration: 1, // Default to 1 month, but logic should override
            price: 0,    // Default to 0, logic should override
            description: 'Custom duration and pricing',
            isActive: true,
            gstRate: 18
        }
    });

    console.log(`✅ Custom Plan seeded: ${customPlan.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
