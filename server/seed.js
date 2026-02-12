const dotenv = require('dotenv');
const prisma = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await prisma.invoice.deleteMany({});
        await prisma.member.deleteMany({});
        await prisma.plan.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.settings.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Users
        const users = await Promise.all([
            prisma.user.create({
                data: {
                    name: 'Admin User',
                    email: 'admin@gym.com',
                    password: await bcrypt.hash('admin123', 10),
                    role: 'ADMIN',
                },
            }),
            prisma.user.create({
                data: {
                    name: 'Staff Member',
                    email: 'staff@gym.com',
                    password: await bcrypt.hash('staff123', 10),
                    role: 'STAFF',
                },
            }),
            prisma.user.create({
                data: {
                    name: 'Gym Trainer',
                    email: 'trainer@gym.com',
                    password: await bcrypt.hash('trainer123', 10),
                    role: 'TRAINER',
                },
            }),
        ]);
        console.log('✅ Created 3 users');

        // Create Plans
        const plans = await Promise.all([
            prisma.plan.create({
                data: {
                    name: 'Monthly',
                    duration: 1,
                    price: 1000,
                    gstRate: 18,
                    description: 'Basic monthly membership',
                },
            }),
            prisma.plan.create({
                data: {
                    name: 'Quarterly',
                    duration: 3,
                    price: 2700,
                    gstRate: 18,
                    description: 'Quarterly membership with 10% discount',
                },
            }),
            prisma.plan.create({
                data: {
                    name: 'Yearly',
                    duration: 12,
                    price: 10000,
                    gstRate: 18,
                    description: 'Yearly membership with best value',
                },
            }),
        ]);
        console.log('✅ Created 3 plans');

        // Helper function to add months
        const addMonths = (date, months) => {
            const result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        };

        // Create Members
        const members = await Promise.all([
            prisma.member.create({
                data: {
                    memberId: 'MEM-0001',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '9876543210',
                    gender: 'MALE',
                    planId: plans[0].id,
                    planStartDate: new Date('2026-01-15'),
                    planEndDate: addMonths(new Date('2026-01-15'), 1),
                    status: 'ACTIVE',
                },
            }),
            prisma.member.create({
                data: {
                    memberId: 'MEM-0002',
                    name: 'Sarah Smith',
                    email: 'sarah@example.com',
                    phone: '9876543211',
                    gender: 'FEMALE',
                    planId: plans[1].id,
                    planStartDate: new Date('2026-01-20'),
                    planEndDate: addMonths(new Date('2026-01-20'), 3),
                    status: 'ACTIVE',
                },
            }),
            prisma.member.create({
                data: {
                    memberId: 'MEM-0003',
                    name: 'Mike Johnson',
                    email: 'mike@example.com',
                    phone: '9876543212',
                    gender: 'MALE',
                    planId: plans[2].id,
                    planStartDate: new Date('2026-01-10'),
                    planEndDate: addMonths(new Date('2026-01-10'), 12),
                    status: 'ACTIVE',
                },
            }),
            prisma.member.create({
                data: {
                    memberId: 'MEM-0004',
                    name: 'Emma Wilson',
                    email: 'emma@example.com',
                    phone: '9876543213',
                    gender: 'FEMALE',
                    planId: plans[0].id,
                    planStartDate: new Date('2026-02-01'),
                    planEndDate: addMonths(new Date('2026-02-01'), 1),
                    status: 'ACTIVE',
                },
            }),
            prisma.member.create({
                data: {
                    memberId: 'MEM-0005',
                    name: 'David Brown',
                    email: 'david@example.com',
                    phone: '9876543214',
                    gender: 'MALE',
                    planId: plans[1].id,
                    planStartDate: new Date('2026-01-28'),
                    planEndDate: addMonths(new Date('2026-01-28'), 3),
                    status: 'ACTIVE',
                },
            }),
        ]);
        console.log('✅ Created 5 members');

        // Helper function to calculate GST
        const calculateGST = (amount, rate = 18) => {
            const gstAmount = (amount * rate) / 100;
            return {
                gstAmount,
                cgst: gstAmount / 2,
                sgst: gstAmount / 2,
                totalAmount: amount + gstAmount,
            };
        };

        // Create Invoices
        await Promise.all([
            prisma.invoice.create({
                data: {
                    invoiceNumber: 'INV-2026-0001',
                    memberId: members[0].id,
                    planId: plans[0].id,
                    amount: 1000,
                    ...calculateGST(1000),
                    paymentStatus: 'PENDING',
                    dueDate: new Date('2026-02-15'),
                },
            }),
            prisma.invoice.create({
                data: {
                    invoiceNumber: 'INV-2026-0002',
                    memberId: members[1].id,
                    planId: plans[1].id,
                    amount: 2700,
                    ...calculateGST(2700),
                    paymentStatus: 'PAID',
                    paidDate: new Date('2026-02-09'),
                    dueDate: new Date('2026-02-10'),
                    paymentMethod: 'UPI',
                },
            }),
            prisma.invoice.create({
                data: {
                    invoiceNumber: 'INV-2026-0003',
                    memberId: members[2].id,
                    planId: plans[2].id,
                    amount: 10000,
                    ...calculateGST(10000),
                    paymentStatus: 'OVERDUE',
                    dueDate: new Date('2026-02-05'),
                },
            }),
            prisma.invoice.create({
                data: {
                    invoiceNumber: 'INV-2026-0004',
                    memberId: members[3].id,
                    planId: plans[0].id,
                    amount: 1000,
                    ...calculateGST(1000),
                    paymentStatus: 'PENDING',
                    dueDate: new Date('2026-02-20'),
                },
            }),
            prisma.invoice.create({
                data: {
                    invoiceNumber: 'INV-2026-0005',
                    memberId: members[4].id,
                    planId: plans[1].id,
                    amount: 2700,
                    ...calculateGST(2700),
                    paymentStatus: 'PAID',
                    paidDate: new Date('2026-02-11'),
                    dueDate: new Date('2026-02-12'),
                    paymentMethod: 'Card',
                },
            }),
        ]);
        console.log('✅ Created 5 invoices');

        // Create Settings
        await prisma.settings.create({
            data: {
                gymName: 'Power Fitness Gym',
                gstNumber: '29ABCDE1234F1Z5',
                address: '123 Gym Street, Fitness City, State - 560001',
                phone: '9876543210',
                email: 'info@powerfitness.com',
                emailNotifications: true,
            },
        });
        console.log('✅ Created gym settings');

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Demo Credentials:');
        console.log('Admin: admin@gym.com / admin123');
        console.log('Staff: staff@gym.com / staff123');
        console.log('Trainer: trainer@gym.com / trainer123');

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

seedData();
