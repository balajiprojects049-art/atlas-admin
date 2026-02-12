const cron = require('node-cron');
const prisma = require('./config/db');
const emailService = require('./services/email.service');

// Initialize Cron Jobs
const initCronJobs = () => {
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('⏰ Running daily membership expiry check...');
        try {
            const today = new Date();
            const fiveDaysLater = new Date(today);
            fiveDaysLater.setDate(today.getDate() + 5);

            // Start of today (00:00:00)
            const startOfToday = new Date(today.setHours(0, 0, 0, 0));
            // End of 5 days later (23:59:59)
            const endOfFiveDaysLater = new Date(fiveDaysLater.setHours(23, 59, 59, 999));

            // Find members whose plan expires within the next 5 days (inclusive)
            const expiringMembers = await prisma.member.findMany({
                where: {
                    planEndDate: {
                        gte: startOfToday,
                        lte: endOfFiveDaysLater,
                    },
                    status: 'ACTIVE',
                    email: { not: null }
                },
                include: {
                    plan: true
                }
            });

            console.log(`🔍 Found ${expiringMembers.length} members expiring in the next 5 days.`);

            for (const member of expiringMembers) {
                // Calculate accurate days remaining
                const expiryDate = new Date(member.planEndDate);
                const timeDiff = expiryDate.getTime() - new Date().getTime();
                const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                // Ensure we don't say "-1 days" or "0 days" if logic is slightly off, 
                // though >= startOfToday essentially handles "0 days" (today).
                // Use strict 0 as minimum for display.
                const displayDays = Math.max(0, daysLeft);

                await emailService.sendExpiryReminder(member, displayDays);
            }

        } catch (error) {
            console.error('❌ Error in daily cron job:', error);
        }
    });

    console.log('✅ Cron jobs initialized: Daily expiry check scheduled for 10:00 AM');
};

module.exports = initCronJobs;
