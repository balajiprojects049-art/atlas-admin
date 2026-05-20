const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');
const prisma = require('../config/db');

router.get('/test-email', async (req, res) => {
    try {
        const logs = [];
        const log = (msg) => logs.push(msg);

        log('🔍 Starting Email Debug...');

        // 1. Check Env Vars availability
        log(`ENV SMTP_HOST: ${process.env.SMTP_HOST ? 'Present' : 'Missing'}`);
        log(`ENV SMTP_USER: ${process.env.SMTP_USER ? 'Present' : 'Missing'}`);
        log(`ENV SMTP_PASS: ${process.env.SMTP_PASS ? 'Present (Hidden)' : 'Missing'}`);
        log(`ENV SMTP_PORT: ${process.env.SMTP_PORT}`);

        // 2. Check Database Settings
        const settings = await prisma.settings.findFirst();
        log(`DB Settings Found: ${!!settings}`);
        if (settings) {
            log(`DB SMTP_HOST: ${settings.smtpHost || 'null'}`);
            log(`DB SMTP_USER: ${settings.smtpUser || 'null'}`);
        }

        // 3. Test Connection
        const transporter = await emailService.getTransporter();

        if (!transporter) {
            return res.status(500).json({
                success: false,
                message: 'Could not create transporter. Check logs.',
                logs
            });
        }

        log('✅ Transporter created. Verifying connection...');

        try {
            await transporter.verify();
            log('✅ SMTP Connection Successful!');
        } catch (verifyError) {
            log(`❌ SMTP Verify Failed: ${verifyError.message}`);
            return res.status(500).json({
                success: false,
                message: 'SMTP Verification Failed',
                error: verifyError.message,
                logs
            });
        }

        // 4. Send Test Email
        const testEmail = process.env.SMTP_USER || settings?.smtpUser;
        if (testEmail) {
            log(`📧 Attempting to send test email to self (${testEmail})...`);
            try {
                const info = await transporter.sendMail({
                    from: `"Debug Test" <${testEmail}>`,
                    to: testEmail,
                    subject: 'Atlas Fitness Test Email',
                    text: 'If you receive this, your email configuration works!'
                });
                log(`✅ Email sent! Message ID: ${info.messageId}`);
            } catch (sendError) {
                log(`❌ Send Mail Failed: ${sendError.message}`);
                return res.status(500).json({
                    success: false,
                    message: 'Sending Failed',
                    error: sendError.message,
                    logs
                });
            }
        } else {
            log('⚠️ Skipping test email (no user found)');
        }

        res.json({
            success: true,
            message: 'Email system works!',
            logs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Debug Route Error',
            error: error.message
        });
    }
});

router.get('/run-cron', async (req, res) => {
    try {
        const logs = [];
        const log = (msg) => {
            console.log(msg);
            logs.push(msg);
        };

        log('⏰ Manually running daily membership expiry check...');
        const today = new Date();
        const fiveDaysLater = new Date(today);
        fiveDaysLater.setDate(today.getDate() + 5);

        // Start of today (00:00:00)
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        // End of 5 days later (23:59:59)
        const endOfFiveDaysLater = new Date(fiveDaysLater.setHours(23, 59, 59, 999));

        // 1. Automatically mark expired members as EXPIRED in the database
        const expiredUpdate = await prisma.member.updateMany({
            where: {
                planEndDate: {
                    lt: startOfToday,
                },
                status: 'ACTIVE',
            },
            data: {
                status: 'EXPIRED',
            },
        });
        log(`✅ Automatically marked ${expiredUpdate.count} expired members as EXPIRED.`);

        // 2. Find members whose plan expires within the next 5 days (inclusive)
        const expiringMembers = await prisma.member.findMany({
            where: {
                planEndDate: {
                    gte: startOfToday,
                    lte: endOfFiveDaysLater,
                },
                status: 'ACTIVE',
                email: { not: '' }
            },
            include: {
                plan: true
            }
        });

        log(`🔍 Found ${expiringMembers.length} members expiring in the next 5 days.`);

        const emailedMembers = [];
        for (const member of expiringMembers) {
            // Calculate accurate days remaining
            const expiryDate = new Date(member.planEndDate);
            const timeDiff = expiryDate.getTime() - new Date().getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const displayDays = Math.max(0, daysLeft);

            log(`📧 Sending expiry reminder to ${member.name} (${member.email}). Expiry date: ${member.planEndDate.toISOString()} (${displayDays} days remaining)`);
            try {
                await emailService.sendExpiryReminder(member, displayDays);
                emailedMembers.push({ id: member.memberId, name: member.name, email: member.email, daysLeft: displayDays });
            } catch (err) {
                log(`❌ Failed to send email to ${member.name}: ${err.message}`);
            }
        }

        res.json({
            success: true,
            message: 'Cron job manual execution complete',
            expiredCount: expiredUpdate.count,
            emailedCount: emailedMembers.length,
            emailedMembers,
            logs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Manual cron execution failed',
            error: error.message
        });
    }
});

module.exports = router;
