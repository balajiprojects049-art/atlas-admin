import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate, numberToWords } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Printer, ArrowLeft, Download, Share2, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getById(id);
            if (response.data.success) {
                setInvoice(response.data.invoice || response.data);
            } else {
                toast.error('Invoice not found');
                navigate('/invoices');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load invoice');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        setDownloading(true);
        const toastId = toast.loading('Generating PDF...');

        try {
            const element = document.getElementById('invoice-preview');

            // Ensure PDF is exactly 1 continuous page
            const pdfWidth = element.offsetWidth;
            const pdfHeight = element.offsetHeight + 2; // small buffer to prevent fraction overflow

            const opt = {
                margin: 0,
                filename: `Invoice_${invoice.invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                pagebreak: { mode: 'avoid-all' },
                jsPDF: { unit: 'px', format: [pdfWidth, pdfHeight], orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
            toast.success('PDF downloaded successfully!', { id: toastId });
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('PDF download failed — opening print dialog instead.', { id: toastId });
            // Fallback: browser print-to-PDF
            setTimeout(() => window.print(), 500);
        } finally {
            setDownloading(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Invoice #${invoice.invoiceNumber}`,
                    text: `Here is your invoice for Atlas Fitness. Total: ${formatCurrency(invoice.totalAmount)}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!invoice) return null;

    const statusColor =
        invoice.paymentStatus === 'PAID'
            ? { bg: '#dcfce7', text: '#166534' }
            : invoice.paymentStatus === 'PENDING'
                ? { bg: '#fef9c3', text: '#854d0e' }
                : { bg: '#fee2e2', text: '#991b1b' };

    return (
        <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>

            {/* Action Bar — hidden on print */}
            <div className="flex items-center justify-between mb-6 print:hidden">
                <Button variant="ghost" onClick={() => navigate('/invoices')} className="flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Invoices
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer size={18} className="mr-2" /> Print
                    </Button>
                    <Button variant="outline" onClick={handleDownload} disabled={downloading}>
                        {downloading
                            ? <><Loader2 size={18} className="mr-2 animate-spin" /> Generating...</>
                            : <><Download size={18} className="mr-2" /> Download PDF</>}
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                        <Share2 size={18} className="mr-2" /> Share
                    </Button>
                </div>
            </div>

            {/* ─── INVOICE PAPER ─── */}
            <div
                id="invoice-preview"
                style={{
                    background: '#fff',
                    maxWidth: '820px',
                    margin: '0 auto',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.13)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    color: '#1a1a1a',
                }}
            >
                {/* ── PRINT ONLY BARS (Repeats on every page) ── */}
                <div className="print-header-bar" style={{ display: 'none', background: 'linear-gradient(90deg,#c0001a,#e8002a)', height: '7px' }} />
                <div className="print-footer-bar" style={{ display: 'none', background: 'linear-gradient(90deg,#c0001a,#e8002a)', height: '5px' }} />

                {/* ── TOP RED ACCENT BAR (Web Only) ── */}
                <div className="print:hidden" style={{ background: 'linear-gradient(90deg,#c0001a,#e8002a)', height: '7px' }} />

                {/* ── INNER CONTENT WITH MARGINS ── */}
                <div className="invoice-content" style={{ padding: '40px 48px' }}>

                    {/* ── HEADER: Logo + Title ── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        {/* Left: Brand */}
                        <div>
                            <img src="/atlas_logo.png" alt="Atlas Fitness" style={{ width: '100px', height: 'auto', objectFit: 'contain', marginBottom: '10px', display: 'block' }} />
                            <div style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                <span style={{ color: '#111' }}>ATLAS</span>
                                <span style={{ color: '#c0001a', marginLeft: '6px' }}>FITNESS</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: '6px', lineHeight: '1.6' }}>
                                <div>3-4-98/4/204, New Narsina Nagar, Mallapur,</div>
                                <div>Hyderabad, Telangana – 500076</div>
                                <div style={{ marginTop: '2px' }}>📞 +91 99882 29441 &nbsp;|&nbsp; +91 83175 29757</div>
                                <div>✉ atlasfitnesselite@gmail.com</div>
                                <div style={{ fontWeight: '700', color: '#444', marginTop: '4px' }}>GSTIN: 36BNEPV0615C1ZA &nbsp;|&nbsp; HSN: 9506</div>
                            </div>
                        </div>

                        {/* Right: Invoice Meta */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#c0001a', letterSpacing: '2px' }}>INVOICE</div>
                            <div style={{ fontSize: '14px', color: '#555', marginTop: '4px', fontWeight: '600' }}>
                                # {invoice.invoiceNumber}
                            </div>
                            <div style={{ marginTop: '16px', fontSize: '12px', color: '#555' }}>
                                <table style={{ borderCollapse: 'collapse', marginLeft: 'auto' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#888' }}>Invoice Date</td>
                                            <td style={{ fontWeight: '600', color: '#222', textAlign: 'right' }}>{formatDate(invoice.createdAt)}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ paddingRight: '12px', paddingBottom: '4px', color: '#888' }}>Valid Upto</td>
                                            <td style={{ fontWeight: '600', color: '#222', textAlign: 'right' }}>{formatDate(invoice.dueDate)}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ paddingRight: '12px', color: '#888' }}>Status</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span style={{
                                                    background: statusColor.bg,
                                                    color: statusColor.text,
                                                    padding: '2px 10px',
                                                    borderRadius: '20px',
                                                    fontWeight: '700',
                                                    fontSize: '11px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}>
                                                    {invoice.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ── DIVIDER ── */}
                    <div style={{ borderTop: '2px solid #f0f0f0', marginBottom: '16px' }} />

                    {/* ── BILL TO ── */}
                    <div style={{ marginBottom: '18px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#c0001a', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Bill To
                        </div>
                        <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderLeft: '4px solid #c0001a', borderRadius: '6px', padding: '14px 18px' }}>
                            <div style={{ fontSize: '17px', fontWeight: '800', color: '#111', marginBottom: '4px' }}>
                                {invoice.member?.name || 'Unknown Member'}
                            </div>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px', color: '#555', marginTop: '4px' }}>
                                <span><b style={{ color: '#333' }}>Member ID:</b> {invoice.member?.memberId || invoice.memberId}</span>
                                {invoice.member?.phone && <span><b style={{ color: '#333' }}>Phone:</b> {invoice.member.phone}</span>}
                                {invoice.member?.email && <span><b style={{ color: '#333' }}>Email:</b> {invoice.member.email}</span>}
                            </div>
                            {(invoice.memberGstNumber || invoice.memberPanNumber) && (
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '12px', color: '#555', marginTop: '6px' }}>
                                    {invoice.memberGstNumber && <span><b style={{ color: '#333' }}>GSTIN:</b> {invoice.memberGstNumber}</span>}
                                    {invoice.memberPanNumber && <span><b style={{ color: '#333' }}>PAN:</b> {invoice.memberPanNumber}</span>}
                                </div>
                            )}
                            {invoice.memberAddress && (
                                <div style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>
                                    <b style={{ color: '#333' }}>Address:</b> {invoice.memberAddress}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── LINE ITEMS TABLE ── */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                                <th style={{ textAlign: 'left', padding: '11px 16px', fontWeight: '700', letterSpacing: '0.5px', borderRadius: '4px 0 0 4px' }}>
                                    Description
                                </th>
                                <th style={{ textAlign: 'center', padding: '11px 16px', fontWeight: '700', letterSpacing: '0.5px', width: '120px' }}>
                                    Duration
                                </th>
                                <th style={{ textAlign: 'right', padding: '11px 16px', fontWeight: '700', letterSpacing: '0.5px', width: '140px', borderRadius: '0 4px 4px 0' }}>
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ fontWeight: '700', color: '#111', marginBottom: '3px' }}>
                                        Gym Membership — {invoice.plan?.name || 'Standard Plan'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#888' }}>
                                        Period: {formatDate(invoice.createdAt)} &nbsp;→&nbsp; {formatDate(invoice.dueDate)}
                                    </div>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'center', color: '#555' }}>
                                    {invoice.plan?.duration || 1} Month{(invoice.plan?.duration || 1) > 1 ? 's' : ''}
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700', color: '#111' }}>
                                    {formatCurrency(invoice.amount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* ── TOTALS ── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '36px' }}>

                        {/* AMOUNT IN WORDS BOX */}
                        <div style={{ width: '380px', background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #334155', borderRadius: '6px', padding: '12px 16px', marginBottom: '8px' }}>
                            <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>TOTAL AMOUNT (IN WORDS)</div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>
                                {numberToWords(Math.round(invoice.totalAmount))}
                            </div>
                        </div>

                        <div style={{ width: '280px', background: '#fafafa', border: '1px solid #ebebeb', borderRadius: '8px', padding: '16px 20px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555' }}>
                                <span>Plan Price</span>
                                <span style={{ fontWeight: '600', color: '#222' }}>
                                    {formatCurrency(invoice.discountType === 'PERCENTAGE'
                                        ? (invoice.amount / (1 - (invoice.discount / 100)))
                                        : (invoice.amount + (invoice.discount || 0)))}
                                </span>
                            </div>
                            {invoice.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#16a34a' }}>
                                    <span>
                                        Discount {invoice.discountType === 'PERCENTAGE' && `(${invoice.discount}%)`}
                                    </span>
                                    <span style={{ fontWeight: '600' }}>
                                        − {formatCurrency(invoice.discountType === 'PERCENTAGE'
                                            ? ((invoice.amount / (1 - (invoice.discount / 100))) * invoice.discount / 100)
                                            : invoice.discount)}
                                    </span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555', borderTop: '1px dashed #ddd', paddingTop: '8px' }}>
                                <span>Taxable Value</span>
                                <span style={{ fontWeight: '600', color: '#222' }}>{formatCurrency(invoice.amount)}</span>
                            </div>
                            {invoice.gstAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555' }}>
                                    <span>GST (18%)</span>
                                    <span style={{ fontWeight: '600', color: '#222' }}>{formatCurrency(invoice.gstAmount)}</span>
                                </div>
                            )}
                            {invoice.lateFee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#dc2626' }}>
                                    <span>Late Fee</span>
                                    <span style={{ fontWeight: '600' }}>{formatCurrency(invoice.lateFee)}</span>
                                </div>
                            )}
                            {/* Total Row */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                borderTop: '2px solid #1a1a1a', paddingTop: '10px', marginTop: '4px',
                                fontWeight: '800', fontSize: '16px',
                            }}>
                                <span style={{ color: '#111' }}>Total Payable</span>
                                <span style={{ color: '#c0001a' }}>{formatCurrency(invoice.totalAmount)}</span>
                            </div>
                            {invoice.paymentStatus === 'PAID' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#16a34a', fontSize: '12px', fontWeight: '700' }}>
                                    <span>✔ Amount Paid</span>
                                    <span>{formatCurrency(invoice.totalAmount)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── MEMBERSHIP TERMS & GYM RULES ── */}
                    <div className="rules-container" style={{ borderTop: '2.5px solid #1a1a1a', paddingTop: '16px', marginBottom: '18px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '3px', color: '#111', textTransform: 'uppercase' }}>
                                ATLAS FITNESS
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', color: '#c0001a', textTransform: 'uppercase', marginTop: '3px' }}>
                                Membership Terms &amp; Gym Rules
                            </div>
                        </div>

                        {/* 2-column grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 28px', fontSize: '10.5px', color: '#444', lineHeight: '1.6' }}>
                            {[
                                { n: '1', label: 'General', text: 'Members must follow all gym policies, maintain discipline, and use equipment responsibly. Entry is allowed only with a valid membership. Proper gym attire and shoes are mandatory.' },
                                { n: '2', label: 'Equipment', text: 'Re-rack weights, dumbbells, and plates after use. Avoid dropping equipment. Machines must be used correctly and any damage must be reported immediately. Share equipment during peak hours.' },
                                { n: '3', label: 'Hygiene', text: 'Maintain strict hygiene. Carry a personal towel, wipe machines after use, and keep the gym clean. Dispose of waste properly and avoid leaving sweat on benches or machines.' },
                                { n: '4', label: 'Safety', text: 'Always warm up and cool down. Use proper techniques and seek trainer guidance when needed. Avoid lifting beyond your capacity without assistance. The gym is not responsible for injuries due to negligence.' },
                                { n: '5', label: 'Conduct', text: 'Respect all members and staff. No fighting, arguments, abusive language, or misconduct will be tolerated. Any violation may result in immediate termination of membership without refund.' },
                                { n: '6', label: 'Belongings & Fees', text: 'Store belongings in lockers. Management is not responsible for any loss or damage. Membership fees are non-refundable and non-transferable. No extensions or pauses unless approved by management.' },
                            ].map(({ n, label, text }) => (
                                <div key={n} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        minWidth: '20px', height: '20px',
                                        background: '#c0001a', color: '#fff',
                                        borderRadius: '50%', fontSize: '9px',
                                        fontWeight: '800', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, marginTop: '1px',
                                    }}>{n}</div>
                                    <div>
                                        <span style={{ fontWeight: '800', color: '#111' }}>{label}: </span>
                                        {text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── FOOTER ── */}
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: '11.5px', color: '#555', maxWidth: '320px' }}>
                            <div style={{ fontWeight: '700', color: '#333', marginBottom: '4px' }}>Note:</div>
                            <div>Thank you for choosing <b>Atlas Fitness</b>! Stay strong and keep pushing! 💪</div>
                            {invoice.razorpayPaymentId && (
                                <div style={{ marginTop: '8px', fontSize: '10px', color: '#888' }}>
                                    Transaction ID: <span style={{ fontFamily: 'monospace' }}>{invoice.razorpayPaymentId}</span>
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ height: '52px', width: '130px', borderBottom: '1.5px solid #555', marginBottom: '6px' }}></div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                Authorized Signatory
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── BOTTOM RED ACCENT BAR (Web Only) ── */}
                <div className="print:hidden" style={{ background: 'linear-gradient(90deg,#c0001a,#e8002a)', height: '5px' }} />
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { 
                        margin: 0; 
                        size: A4; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: #fff !important;
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                    }
                    #invoice-preview {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100vh !important;
                        max-height: 100vh !important;
                        overflow: hidden !important;
                        page-break-inside: avoid !important;
                    }
                    .invoice-content {
                        padding: 20px 24px !important;
                        transform: scale(0.92);
                        transform-origin: top center;
                    }
                    .print\\:hidden { display: none !important; }

                    /* Repeat red bars on every page */
                    .print-header-bar {
                        display: block !important;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 7px;
                        z-index: 9999;
                    }
                    .print-footer-bar {
                        display: block !important;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 5px;
                        z-index: 9999;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceDetails;
