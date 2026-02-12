const dotenv = require('dotenv');
const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await prisma.invoice.deleteMany({});
        await prisma.member.deleteMany({});
        await prisma.plan.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.settings.deleteMany({});
        console.log('✅ Cleared all data');

        // Create Admin User
        await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@gym.com',
                password: await bcrypt.hash('admin123', 10),
                role: 'ADMIN',
            },
        });
        console.log('✅ Created Admin user');

        // Create Staff User
        await prisma.user.create({
            data: {
                name: 'Staff Member',
                email: 'staff@gym.com',
                password: await bcrypt.hash('staff123', 10),
                role: 'STAFF',
            },
        });
        console.log('✅ Created Staff user');

        // Real Plans from Atlas Fitness Elite
        const realPlans = [
            { name: '1 Month', duration: 1, price: 2999 },
            { name: '2 Months', duration: 2, price: 5499 },
            { name: '3 Months', duration: 3, price: 8599 },
            { name: '4 Months', duration: 4, price: 9999 },
            { name: '5 Months', duration: 5, price: 12599 },
            { name: '6 Months', duration: 6, price: 14999 },
            { name: '8 Months', duration: 8, price: 21000 },
            { name: '10 Months', duration: 10, price: 25599 },
            { name: '12 Months', duration: 12, price: 28999 },
            { name: '15 Months', duration: 15, price: 34999 },
            { name: '18 Months', duration: 18, price: 39999 },
            { name: '24 Months', duration: 24, price: 55999 },
        ];

        // Create Plans
        await Promise.all(
            realPlans.map(plan =>
                prisma.plan.create({
                    data: {
                        name: plan.name,
                        duration: plan.duration,
                        price: plan.price,
                        gstRate: 18,
                        description: `${plan.name} Membership Plan`,
                    },
                })
            )
        );
        console.log(`✅ Created ${realPlans.length} real plans`);

        // Create Settings
        await prisma.settings.create({
            data: {
                gymName: 'Atlas Fitness Elite',
                gstNumber: '29ABCDE1234F1Z5',
                address: '123 Fitness Ave, Gym City',
                phone: '9876543210',
                email: 'info@atlasfitness.com',
                emailNotifications: true,
            },
        });
        console.log('✅ Created gym settings');

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Demo Credentials:');
        console.log('Admin: admin@gym.com / admin123');
        console.log('Staff: staff@gym.com / staff123');

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

seedData();
