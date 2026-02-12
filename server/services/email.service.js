const nodemailer = require('nodemailer');
const prisma = require('../config/db');

const PDFDocument = require('pdfkit');

class EmailService {
    async getTransporter() {
        // ... (existing getTransporter code) ...
        const settings = await prisma.settings.findFirst();

        if (settings && settings.smtpHost && settings.smtpUser && settings.smtpPass) {
            console.log('📬 Using SMTP settings from Database');
            return nodemailer.createTransport({
                host: settings.smtpHost,
                port: settings.smtpPort || 587,
                secure: settings.smtpPort === 465,
                auth: {
                    user: settings.smtpUser,
                    pass: settings.smtpPass,
                },
            });
        }

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            console.log('📬 Using SMTP settings from Environment Variables');
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }

        console.error('❌ No SMTP settings found in DB or .env');
        return null;
    }

    generateInvoicePDF(invoice, gymName) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- Header ---
            doc.fontSize(20).font('Helvetica-Bold').text('ATLAS FITNESS', { continued: true });
            doc.fillColor('#dc2626').text(' ELITE'); // Red 'ELITE'
            doc.fillColor('black').fontSize(10).font('Helvetica').text('Premium Fitness Management', { align: 'left' });
            doc.text('GSTIN: 36BNEPV0615C1ZA', { align: 'left' });
            doc.moveDown();

            // Invoice Title
            doc.fontSize(25).font('Helvetica-Bold').text('INVOICE', { align: 'right' });
            doc.moveDown();

            // --- Invoice Details ---
            const customerInfoTop = 150;

            doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, customerInfoTop);
            doc.font('Helvetica').text(invoice.member.name, 50, customerInfoTop + 15);
            doc.text(`ID: ${invoice.member.memberId || 'N/A'}`, 50, customerInfoTop + 30);
            doc.text(invoice.member.email, 50, customerInfoTop + 45);
            doc.text(invoice.member.phone || '', 50, customerInfoTop + 60);

            doc.font('Helvetica-Bold').text('Invoice Number:', 400, customerInfoTop);
            doc.font('Helvetica').text(invoice.invoiceNumber, 500, customerInfoTop);
            doc.font('Helvetica-Bold').text('Invoice Date:', 400, customerInfoTop + 15);
            doc.font('Helvetica').text(new Date().toLocaleDateString(), 500, customerInfoTop + 15);
            doc.font('Helvetica-Bold').text('Balance Due:', 400, customerInfoTop + 30);
            doc.fillColor('#dc2626').text('Rs. 0.00', 500, customerInfoTop + 30); // Valid considering it's paid
            doc.fillColor('black');

            doc.moveDown();

            // --- Items Table ---
            const tableTop = 250;
            const itemCodeX = 50;
            const descriptionX = 100;
            const amountX = 450;

            doc.font('Helvetica-Bold');
            doc.text('Item', itemCodeX, tableTop);
            doc.text('Description', descriptionX, tableTop);
            doc.text('Amount', amountX, tableTop, { align: 'right' });

            const invoiceTableTop = 265;
            doc.moveTo(50, invoiceTableTop).lineTo(550, invoiceTableTop).stroke();

            // Item Row
            const position = invoiceTableTop + 10;
            doc.font('Helvetica');
            doc.text('1', itemCodeX, position);
            doc.text(`Membership Plan - ${invoice.plan?.name || 'Standard'}`, descriptionX, position);
            doc.text(`Rs. ${invoice.amount}`, amountX, position, { align: 'right' });

            // --- Totals ---
            const subtotalPosition = position + 40;
            doc.moveTo(50, subtotalPosition - 10).lineTo(550, subtotalPosition - 10).stroke();

            const totalX = 400;
            const valueX = 450;

            doc.font('Helvetica-Bold');
            doc.text('Subtotal:', totalX, subtotalPosition);
            doc.font('Helvetica').text(`Rs. ${invoice.amount}`, valueX, subtotalPosition, { align: 'right' });

            const gstPosition = subtotalPosition + 15;
            doc.font('Helvetica-Bold').text(`GST (${((invoice.gstAmount / invoice.amount) * 100).toFixed(0)}%):`, totalX, gstPosition);
            doc.font('Helvetica').text(`Rs. ${invoice.gstAmount.toFixed(2)}`, valueX, gstPosition, { align: 'right' });

            const totalPosition = gstPosition + 25;
            doc.font('Helvetica-Bold').fontSize(12).text('Total:', totalX, totalPosition);
            doc.fillColor('#dc2626').text(`Rs. ${invoice.totalAmount.toFixed(2)}`, valueX, totalPosition, { align: 'right' });

            // Footer
            doc.fontSize(10).fillColor('gray').text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });

            doc.end();
        });
    }

    async sendWelcomeEmail(member) {
        // ... (existing welcome email code) ...
        // Ensure this method remains intact
        try {
            const transporter = await this.getTransporter();
            if (!transporter) return;

            const settings = await prisma.settings.findFirst();
            const gymName = settings?.gymName || 'Atlas Fitness Elite';

            const mailOptions = {
                from: `"Atlas Fitness Elite" <atlasfitnessservices122@gmail.com>`,
                to: member.email,
                subject: `Welcome to Atlas Fitness Elite, ${member.name}!`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #000; margin: 0; font-size: 28px;">ATLAS <span style="color: #dc2626;">FITNESS</span> ELITE</h1>
                            <p style="color: #666; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Management System</p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
                            <h2 style="color: #333; margin-top: 0;">Welcome to the Family!</h2>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                Hello <strong>${member.name}</strong>,
                            </p>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                We are absolutely thrilled to welcome you to <strong>${gymName}</strong>! Your journey to elite fitness starts today.
                            </p>
                            <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                Your membership has been successfully registered under <strong>ID: ${member.memberId}</strong>.
                            </p>
                        </div>

                        <div style="margin-bottom: 30px;">
                            <h3 style="color: #333; border-bottom: 2px solid #dc2626; padding-bottom: 8px; margin-bottom: 15px;">Your Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #666; width: 40%;">Member Name:</td>
                                    <td style="padding: 10px 0; color: #333; font-weight: bold;">${member.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666;">Member ID:</td>
                                    <td style="padding: 10px 0; color: #dc2626; font-weight: bold;">${member.memberId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666;">Email:</td>
                                    <td style="padding: 10px 0; color: #333;">${member.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666;">Plan:</td>
                                    <td style="padding: 10px 0; color: #333;">${member.plan?.name || 'Standard Membership'}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="color: #999; font-size: 14px;">
                                Stay strong, Stay elite.<br>
                                © 2026 ${gymName}
                            </p>
                        </div>
                    </div>
                `,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent: %s', info.messageId);
        } catch (error) {
            console.error('❌ Error sending welcome email:', error);
        }
    }

    async sendInvoiceEmail(invoice) {
        try {
            const transporter = await this.getTransporter();
            if (!transporter) return;

            const settings = await prisma.settings.findFirst();
            const gymName = settings?.gymName || 'Atlas Fitness Elite';

            // Generate PDF Buffer
            const pdfBuffer = await this.generateInvoicePDF(invoice, gymName);

            const mailOptions = {
                from: `"Atlas Fitness Elite" <atlasfitnessservices122@gmail.com>`,
                to: invoice.member.email,
                subject: `Payment Receipt - ${invoice.invoiceNumber} | ${gymName}`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #000; margin: 0; font-size: 28px;">ATLAS <span style="color: #dc2626;">FITNESS</span> ELITE</h1>
                            <p style="color: #666; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Payment Receipt</p>
                        </div>
                        
                        <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
                            <h2 style="color: #166534; margin-top: 0; text-align: center;">Payment Successful!</h2>
                            <p style="color: #166534; font-size: 16px; line-height: 1.6; text-align: center;">
                                Thank you, <strong>${invoice.member.name}</strong>.<br>
                                We have received your payment. A PDF copy of your invoice is attached.
                            </p>
                        </div>

                        <div style="margin-bottom: 30px;">
                            <h3 style="color: #333; border-bottom: 2px solid #dc2626; padding-bottom: 8px; margin-bottom: 15px;">Invoice Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #666; width: 40%;">Invoice Number:</td>
                                    <td style="padding: 10px 0; color: #333; font-weight: bold;">${invoice.invoiceNumber}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666;">Plan:</td>
                                    <td style="padding: 10px 0; color: #333;">${invoice.plan?.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666;">Amount Paid:</td>
                                    <td style="padding: 10px 0; color: #dc2626; font-weight: bold; font-size: 18px;">Rs. ${invoice.totalAmount}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666;">Payment Date:</td>
                                    <td style="padding: 10px 0; color: #333;">${new Date().toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #666;">Status:</td>
                                    <td style="padding: 10px 0; color: #166534; font-weight: bold;">PAID</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="color: #999; font-size: 14px;">
                                Train Hard. Stay Consistent.<br>
                                © 2026 ${gymName}
                            </p>
                        </div>
                    </div>
                `,
                attachments: [
                    {
                        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Invoice email sent: %s', info.messageId);
        } catch (error) {
            console.error('❌ Error sending invoice email:', error);
        }
    }
    async sendExpiryReminder(member, daysLeft) {
        try {
            const transporter = await this.getTransporter();
            if (!transporter) return;

            const settings = await prisma.settings.findFirst();
            const gymName = settings?.gymName || 'Atlas Fitness Elite';

            const mailOptions = {
                from: `"Atlas Fitness Elite" <atlasfitnessservices122@gmail.com>`,
                to: member.email,
                subject: `⚠️ Membership Expiring in ${daysLeft} Days | ${gymName}`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #000; margin: 0; font-size: 28px;">ATLAS <span style="color: #dc2626;">FITNESS</span> ELITE</h1>
                            <p style="color: #666; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Membership Alert</p>
                        </div>
                        
                        <div style="background-color: #fff1f2; padding: 30px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #fecdd3;">
                            <h2 style="color: #9f1239; margin-top: 0; text-align: center;">Don't Lose Your Gains!</h2>
                            <p style="color: #881337; font-size: 16px; line-height: 1.6; text-align: center;">
                                Hello <strong>${member.name}</strong>,<br>
                                This is a friendly reminder that your membership is expiring soon.
                            </p>
                        </div>

                        <div style="margin-bottom: 30px; text-align: center;">
                            <div style="display: inline-block; padding: 15px 30px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                                <p style="margin: 0; color: #64748b; font-size: 14px;">Your plan expires on:</p>
                                <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 24px; font-weight: bold;">
                                    ${new Date(member.planEndDate).toLocaleDateString()}
                                </p>
                                <p style="margin: 5px 0 0 0; color: #0f172a; font-weight: bold;">
                                    (${daysLeft} Days Remaining)
                                </p>
                            </div>
                        </div>

                        <p style="text-align: center; color: #555; line-height: 1.6; margin-bottom: 30px;">
                            To ensure uninterrupted access to the gym and keep your fitness journey on track, please renew your membership before the expiry date.
                        </p>

                        <div style="text-align: center; margin-bottom: 40px;">
                            <a href="#" style="background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Renew Now</a>
                        </div>

                        <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                            <p style="color: #999; font-size: 14px;">
                                Train Hard. Stay Consistent.<br>
                                © 2026 ${gymName}
                            </p>
                        </div>
                    </div>
                `,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✅ Expiry reminder sent to ${member.email}: %s`, info.messageId);
        } catch (error) {
            console.error('❌ Error sending expiry reminder:', error);
        }
    }
}

module.exports = new EmailService();
