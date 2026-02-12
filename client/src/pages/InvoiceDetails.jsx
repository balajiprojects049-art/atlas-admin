import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Printer, ArrowLeft, Download, Share2 } from 'lucide-react';

const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getById(id);
            if (response.data.success) {
                setInvoice(response.data.invoice || response.data); // in case backend returns directly
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
                <Button variant="ghost" onClick={() => navigate('/invoices')} className="flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Invoices
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer size={20} className="mr-2" /> Print
                    </Button>
                    <Button variant="outline">
                        <Download size={20} className="mr-2" /> Download
                    </Button>
                    <Button variant="outline">
                        <Share2 size={20} className="mr-2" /> Share
                    </Button>
                </div>
            </div>

            {/* Invoice Container - White Paper Style */}
            <div className="bg-white text-gray-900 p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto print:shadow-none print:w-full print:max-w-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-indigo-700 tracking-wide uppercase">INVOICED</h1>
                        <h2 className="text-lg font-semibold mt-2">Atlas Fitness Services IT</h2>
                        <div className="text-sm text-gray-500 mt-1">
                            <p>123 Gym Street, Fitness City</p>
                            <p>+91 98765 43210 | info@atlasfitness.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold text-gray-800">INVOICE</h3>
                        <p className="text-gray-500 text-sm mt-1">#{invoice.invoiceNumber}</p>
                        <div className="mt-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium">{formatDate(invoice.createdAt)}</span>
                            </div>
                            <div className="flex justify-between gap-4 mt-1">
                                <span className="text-gray-600">Due Date:</span>
                                <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                            </div>
                            <div className="flex justify-between gap-4 mt-1">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium px-2 py-0.5 rounded text-xs uppercase ${invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                        invoice.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {invoice.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-12">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">BILL TO:</h3>
                    <div className="text-gray-800">
                        <p className="text-xl font-bold">{invoice.member?.name || 'Unknown Member'}</p>
                        <p className="text-sm text-gray-500">{invoice.memberId}</p>
                        <p className="text-sm text-gray-500">{invoice.member?.phone}</p>
                        <p className="text-sm text-gray-500">{invoice.member?.email}</p>
                    </div>
                </div>

                {/* Line Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Description</th>
                            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-4">
                                <p className="font-medium text-gray-800">{invoice.plan?.duration || 1} Months Gym Membership</p>
                                <p className="text-sm text-gray-500">Plan: {invoice.plan?.name}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatDate(invoice.createdAt)} - {formatDate(invoice.dueDate)}
                                </p>
                            </td>
                            <td className="py-4 text-right font-medium text-gray-800">
                                {formatCurrency(invoice.amount)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(invoice.amount)}</span>
                        </div>
                        {invoice.gstAmount > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax (18%):</span>
                                <span>{formatCurrency(invoice.gstAmount)}</span>
                            </div>
                        )}
                        {invoice.lateFee > 0 && (
                            <div className="flex justify-between text-sm text-red-500">
                                <span>Late Fee:</span>
                                <span>{formatCurrency(invoice.lateFee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-indigo-700 pt-3 border-t border-gray-200">
                            <span>Total Payable:</span>
                            <span>{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                        {invoice.paymentStatus === 'PAID' && (
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Paid:</span>
                                <span>{formatCurrency(invoice.totalAmount)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-8 flex justify-between items-end">
                    <div className="text-sm text-gray-500 max-w-sm">
                        <p className="font-medium text-gray-700 mb-1">Notes:</p>
                        <p>Thank you for your business!</p>
                        {invoice.razorpayPaymentId && (
                            <p className="mt-2 text-xs">Transaction ID: {invoice.razorpayPaymentId}</p>
                        )}
                    </div>
                    <div className="text-center">
                        <div className="h-16 w-32 mb-2"></div> {/* Signature Placeholder */}
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;
