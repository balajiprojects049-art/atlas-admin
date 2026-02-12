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

module.exports = router;
