import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { memberAPI, invoiceAPI, paymentAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Printer, ArrowLeft } from 'lucide-react';

const EditInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previousDue, setPreviousDue] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        memberId: '',
        memberName: '',
        memberEmail: '',
        memberPhone: '',
        planId: '',
        planName: '',
        trainerName: '',
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        billingStart: '',
        billingEnd: '',
        amount: '',
        discount: 0,
        discountType: 'PERCENTAGE',
        taxRate: 18,
        lateFee: 0,
        paymentMode: 'CASH',
        transactionId: '',
        paymentStatus: 'PENDING',
        paidAmount: 0,
        gstAmount: 0,
        totalAmount: 0,
        remainingBalance: 0,
        notes: ''
    });

    useEffect(() => {
        fetchInvoiceDetails();
    }, [id]);

    const fetchInvoiceDetails = async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getById(id);
            const data = response.data;
            if (data.success || data.id) {
                const invoice = data.invoice || data;

                // Populate form data from existing invoice
                setFormData(prev => ({
                    ...prev,
                    memberId: invoice.memberId,
                    memberName: invoice.member?.name || '',
                    memberEmail: invoice.member?.email || '',
                    memberPhone: invoice.member?.phone || '',
                    planId: invoice.planId || '',
                    planName: invoice.plan?.name || '',
                    trainerName: invoice.trainerName || '',
                    invoiceNumber: invoice.invoiceNumber,
                    invoiceDate: invoice.createdAt ? invoice.createdAt.split('T')[0] : '',
                    dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
                    billingStart: invoice.billingStart ? invoice.billingStart.split('T')[0] : '',
                    billingEnd: invoice.billingEnd ? invoice.billingEnd.split('T')[0] : '',
                    amount: invoice.amount || 0,
                    discount: invoice.discount || 0,
                    discountType: invoice.discountType || 'PERCENTAGE',
                    taxRate: invoice.gstRate || 18,
                    lateFee: invoice.lateFee || 0,
                    paymentMode: invoice.paymentMethod || 'CASH',
                    transactionId: invoice.razorpayPaymentId || '',
                    paymentStatus: invoice.paymentStatus || 'PENDING',
                    paidAmount: invoice.paidAmount || 0,
                    notes: invoice.notes || '',
                }));

                // Fetch previous dues for this member
                if (invoice.memberId) {
                    fetchMemberDues(invoice.memberId, invoice.id);
                }
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('Failed to load invoice details');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const fetchMemberDues = async (memberId, currentInvoiceId) => {
        try {
            const invoiceRes = await invoiceAPI.getAll({ memberId, status: 'PENDING' });
            if (invoiceRes.data.success) {
                const pendingInvoices = invoiceRes.data.invoices || [];
                // Sum all pending invoices except the current one
                const due = pendingInvoices
                    .filter(inv => inv.id !== currentInvoiceId)
                    .reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0);
                setPreviousDue(due);
            }
        } catch (error) {
            console.error('Error fetching member dues:', error);
        }
    };

    // Calculate Totals whenever relevant fields change
    useEffect(() => {
        if (!loading) {
            calculateTotals();
        }
    }, [formData.amount, formData.discount, formData.discountType, formData.taxRate, formData.lateFee, formData.paidAmount, previousDue, loading]);

    const calculateTotals = () => {
        const baseAmount = parseFloat(formData.amount) || 0;
        const discountVal = parseFloat(formData.discount) || 0;
        let discountAmount = 0;

        if (formData.discountType === 'PERCENTAGE') {
            discountAmount = (baseAmount * discountVal) / 100;
        } else {
            discountAmount = discountVal;
        }

        const taxableAmount = Math.max(0, baseAmount - discountAmount);
        const taxRate = parseFloat(formData.taxRate) || 18;
        const gstAmount = (taxableAmount * taxRate) / 100;

        const currentTotal = taxableAmount + gstAmount + (parseFloat(formData.lateFee) || 0);
        const grandTotal = currentTotal + (parseFloat(previousDue) || 0);
        const paid = parseFloat(formData.paidAmount) || 0;
        const remaining = Math.max(0, grandTotal - paid);

        setFormData(prev => ({
            ...prev,
            gstAmount: gstAmount,
            totalAmount: grandTotal,
            remainingBalance: remaining
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.dueDate) {
            toast.error('Please select a due date');
            return;
        }

        setSaving(true);
        try {
            const amount = parseFloat(formData.amount) || 0;
            const taxRate = parseFloat(formData.taxRate) || 18;
            const lateFee = parseFloat(formData.lateFee) || 0;
            const paidAmount = parseFloat(formData.paidAmount) || 0;

            // Mapping to Backend Schema
            const payload = {
                amount,
                gstRate: taxRate,
                lateFee,
                paidAmount,
                dueDate: new Date(formData.dueDate),
                paymentStatus: formData.paymentStatus,
                paymentMethod: formData.paymentMode,
                razorpayPaymentId: formData.transactionId,
                notes: formData.notes,
                trainerName: formData.trainerName,
                discount: parseFloat(formData.discount) || 0,
                discountType: formData.discountType
            };

            const response = await invoiceAPI.update(id, payload);
            if (response.data.success) {
                toast.success('Invoice Updated Successfully!');
                navigate('/invoices');
            }
        } catch (error) {
            console.error('Update Invoice Error:', error);
            const message = error.response?.data?.message || 'Failed to update invoice';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
            <div className="w-full lg:w-1/2 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Invoice</h1>
                        <p className="text-gray-500 text-sm">Update existing invoice details.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Details - Mostly Read Only in Edit */}
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Customer Details</h3>
                        <Input label="Member" value={`${formData.memberName} (${formData.memberId})`} readOnly />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Mobile Number" value={formData.memberPhone} readOnly />
                            <Input label="Email" value={formData.memberEmail} readOnly />
                        </div>
                        <Input label="Plan" value={formData.planName} readOnly />
                    </Card>

                    {/* Invoice Details */}
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Invoice Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Invoice #" value={formData.invoiceNumber} readOnly />
                            <Input label="Invoice Date" type="date" value={formData.invoiceDate} readOnly />
                        </div>
                        <Input label="Due Date" type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                    </Card>

                    {/* Payment Details */}
                    <Card className="p-4 space-y-6">
                        <h3 className="font-semibold text-lg border-b pb-2 dark:border-gray-700">Payment Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Plan Amount (₹)" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
                            <Input label="Tax (GST %)" name="taxRate" type="number" value={formData.taxRate} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2">
                                <Input label="Discount" name="discount" type="number" value={formData.discount} onChange={handleChange} wrapperClassName="flex-1" />
                                <Select
                                    label="Type"
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleChange}
                                    options={[{ value: 'AMOUNT', label: '₹' }, { value: 'PERCENTAGE', label: '%' }]}
                                    wrapperClassName="w-24"
                                />
                            </div>
                            <Input label="Late Fee (₹)" name="lateFee" type="number" value={formData.lateFee} onChange={handleChange} />
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md text-right border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Final Payable Amount</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(formData.totalAmount)}</p>
                        </div>
                    </Card>

                    {/* Payment Mode */}
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Payment Mode & Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Payment Mode"
                                name="paymentMode"
                                value={formData.paymentMode}
                                onChange={handleChange}
                                options={[
                                    { value: 'CASH', label: 'Cash' },
                                    { value: 'RAZORPAY', label: 'Razorpay' }
                                ]}
                            />
                            <Select
                                label="Payment Status"
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                onChange={handleChange}
                                options={[
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'PAID', label: 'Paid' },
                                    { value: 'PARTIAL', label: 'Partial' },
                                    { value: 'OVERDUE', label: 'Overdue' }
                                ]}
                            />
                        </div>
                        <Input label="Transaction ID / UTR" name="transactionId" value={formData.transactionId} onChange={handleChange} placeholder="Optional" />
                        <Input label="Paid Amount (₹)" name="paidAmount" type="number" value={formData.paidAmount} onChange={handleChange} />
                    </Card>

                    <TextArea label="Notes / Remarks" name="notes" value={formData.notes} onChange={handleChange} />

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/invoices')}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1" isLoading={saving}>
                            Update Invoice
                        </Button>
                    </div>
                </form>
            </div>

            {/* LIVE PREVIEW - Similar to CreateInvoice */}
            <div className="w-full lg:w-1/2 hidden lg:block">
                <div className="sticky top-6">
                    <div className="bg-white text-black p-8 rounded-lg shadow-lg border border-gray-200 min-h-[800px] text-sm relative" id="invoice-preview">
                        <div className="flex justify-between items-start border-b pb-6 mb-6">
                            <div>
                                <img src="/gym_logo.png" alt="Logo" className="w-20 h-20 object-contain mb-4" />
                                <h1 className="text-3xl font-bold text-indigo-800 uppercase tracking-wide">Invoiced</h1>
                                <p className="font-semibold text-lg mt-1">Atlas Fitness Elite</p>
                                <p className="text-gray-500 text-xs">3-4-98/4/204, New Narsina Nagar, Mallapur, Hyderabad, Telangana 500076</p>
                                <p className="text-gray-500 text-xs">+91 99882 29441, +91 83175 29757</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-gray-700">INVOICE</h2>
                                <p className="text-gray-500">#{formData.invoiceNumber}</p>
                                <p className="mt-2 text-xs">Date: {formatDate(formData.invoiceDate)}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-gray-600 uppercase text-xs font-bold mb-2">Bill To:</h3>
                            <h2 className="text-xl font-bold">{formData.memberName}</h2>
                            <p className="text-gray-600">{formData.memberPhone}</p>
                        </div>

                        <table className="w-full mb-8">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-left font-bold">
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-4">
                                        <p className="font-semibold">{formData.planName}</p>
                                    </td>
                                    <td className="py-4 text-right">{formatCurrency(formData.amount)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-end">
                            <div className="w-1/2 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(formData.amount)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-indigo-900 border-t pt-2">
                                    <span>Total Amount:</span>
                                    <span>{formatCurrency(formData.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Paid:</span>
                                    <span>{formatCurrency(formData.paidAmount)}</span>
                                </div>
                                <div className="flex justify-between text-red-600 font-bold border-t-2 pt-2">
                                    <span>Remaining:</span>
                                    <span>{formatCurrency(formData.remainingBalance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple TextArea component if not in generic inputs
const TextArea = ({ label, ...props }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <textarea
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            rows={3}
            {...props}
        />
    </div>
);

export default EditInvoice;
