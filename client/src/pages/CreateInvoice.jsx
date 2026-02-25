import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { memberAPI, invoiceAPI, analyticsAPI, paymentAPI, planAPI } from '../services/api';
import { formatCurrency, formatDate, numberToWords } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Printer, Share2, Download, Mail } from 'lucide-react'; // Assuming lucide-react or generic icons
// If lucide-react not available, I'll use text or standard emojis/svgs.
// Reverting to text/simple SVGs if package not confirmed. I'll use simple text for buttons to be safe.

const CreateInvoice = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previousDue, setPreviousDue] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        // Customer Details
        memberId: '',
        memberName: '',
        memberEmail: '',
        memberPhone: '',
        memberGstNumber: '',
        memberPanNumber: '',
        memberAddress: '',
        planId: '',
        planName: '',
        trainerName: '', // Optional, not in DB yet

        // Invoice Details
        invoiceNumber: 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'), // Mock generation
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        billingStart: '',
        billingEnd: '',

        // Payment Details
        amount: '', // Base Plan Amount
        discount: 0,
        discountType: 'PERCENTAGE', // AMOUNT or PERCENTAGE
        taxRate: 18, // GST %
        lateFee: 0,

        // Payment Mode
        paymentMode: 'CASH',
        transactionId: '',
        paymentStatus: 'PENDING',
        paidAmount: 0,

        // Final Calculations (derived but helpful to store if needed)
        gstAmount: 0,
        totalAmount: 0,
        remainingBalance: 0,

        notes: ''
    });

    const [plans, setPlans] = useState([]);

    // Fetch Members and Plans on Mount
    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await planAPI.getAll();
            if (response.data.success) {
                setPlans(response.data.plans);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    // Handle initial pre-fill from navigation state once members are loaded
    useEffect(() => {
        if (members.length > 0 && location.state?.memberId) {
            const memberId = location.state.memberId;
            // Manually trigger the change logic
            const mockEvent = { target: { value: memberId, name: 'memberId' } };
            handleMemberChange(mockEvent);
        }
    }, [members, location.state]);

    // Calculate Totals whenever relevant fields change
    useEffect(() => {
        calculateTotals();
    }, [formData.amount, formData.discount, formData.discountType, formData.taxRate, formData.lateFee, formData.paidAmount, previousDue]);

    const fetchMembers = async () => {
        try {
            const response = await memberAPI.getAll({ limit: 100 });
            if (response.data.success) {
                setMembers(response.data.members);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const fetchMemberDetails = async (memberId) => {
        // Fetch member specifics (like previous due)
        try {
            // Mocking previous due for now or fetch invoices
            const invoiceRes = await invoiceAPI.getAll({ memberId, status: 'PENDING' });
            if (invoiceRes.data.success) {
                const due = invoiceRes.data.invoices.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0);
                setPreviousDue(due);
            }
        } catch (error) {
            console.error('Error fetching member dues:', error);
        }
    };

    const handleMemberChange = (e) => {
        const memberId = e.target.value;
        const member = members.find(m => m.id === memberId);

        if (member) {
            const isRenewal = location.state?.isRenewal;
            let billingStart = member.planStartDate ? member.planStartDate.split('T')[0] : '';
            let billingEnd = member.planEndDate ? member.planEndDate.split('T')[0] : '';
            let dueDate = member.planEndDate ? member.planEndDate.split('T')[0] : '';
            let notes = '';

            if (isRenewal) {
                // If strictly renewing, start from where previous ended, or today if expired
                const today = new Date();
                const currentEnd = member.planEndDate ? new Date(member.planEndDate) : null;

                if (currentEnd && currentEnd > today) {
                    billingStart = currentEnd.toISOString().split('T')[0]; // Start from old expiry
                } else {
                    billingStart = today.toISOString().split('T')[0]; // Start from today
                }

                // Temporary end date placeholder (will update when plan ID logic runs fully or just clear it to let duration calc take over if I had that logic here)
                // For now, let's just clear End Date so it forces attention or use the same logic as 'handleMembershipRenewal' to estimate
                // But since Member object has plan details, let's try to be smart if plan exists
                if (member.plan?.duration) {
                    const start = new Date(billingStart);
                    const end = new Date(start);
                    end.setMonth(end.getMonth() + member.plan.duration);
                    billingEnd = end.toISOString().split('T')[0];
                    dueDate = billingEnd;
                }

                notes = `Renewal for ${member.plan?.name || 'Membership'}`;
            }

            setFormData(prev => ({
                ...prev,
                memberId: member.id,
                memberName: member.name,
                memberEmail: member.email,
                memberPhone: member.phone,
                memberGstNumber: member.gstNumber || '',
                memberPanNumber: member.panNumber || '',
                memberAddress: member.address || '',
                planId: member.planId || '',
                planName: member.plan?.name || '',
                amount: member.plan?.price || '',
                billingStart: billingStart,
                billingEnd: billingEnd,
                dueDate: dueDate,
                notes: notes
            }));
            fetchMemberDetails(member.id);
        }
    };

    const handlePlanChange = (e) => {
        const planId = e.target.value;
        const selectedPlan = plans.find(p => p.id === planId);

        if (selectedPlan) {
            // Determine start date: if renewal and old plan hasn't expired, use old end date. Else today.
            // Note: If changing plans, logic remains same: extend from current validity or start fresh.
            let start = formData.billingStart || new Date().toISOString().split('T')[0];

            // Calculate new end date based on plan duration
            const startDateObj = new Date(start);
            const endDateObj = new Date(startDateObj);
            endDateObj.setMonth(endDateObj.getMonth() + selectedPlan.duration);

            const billingEnd = endDateObj.toISOString().split('T')[0];

            setFormData(prev => ({
                ...prev,
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                amount: selectedPlan.price,
                billingEnd: billingEnd,
                dueDate: billingEnd, // Due date usually matches end of service or immediate? Actually for prepaid it's immediate. 
                // But logic in previous step set it to EndDate. Let's stick to that for consistency or revert to Today if immediate payment needed.
                // Actually, standard invoice due date is typically "Upon Receipt" for gym. 
                // But let's keep the existing logic: Due Date = Plan Expiry (unless overridden).
                // Wait, logically Due Date for payment should be Today (or Billing Start). 
                // Let's set Due Date to Today for new invoices, but keep the auto-fill logic user liked.
            }));

            // Trigger explicit recalculation if needed, or rely on useEffect
        }
    };

    const calculateTotals = () => {
        const baseAmount = parseFloat(formData.amount) || 0;
        let discountAmount = parseFloat(formData.discount) || 0;

        if (formData.discountType === 'PERCENTAGE') {
            discountAmount = (baseAmount * discountAmount) / 100;
        }

        const taxableAmount = Math.max(0, baseAmount - discountAmount);
        const gstAmount = (taxableAmount * parseFloat(formData.taxRate || 18)) / 100;

        // Subtotal (Current Invoice)
        const currentTotal = taxableAmount + gstAmount + (parseFloat(formData.lateFee) || 0);

        // Grand Total (Including Previous Due)
        const grandTotal = currentTotal + previousDue;

        const paid = parseFloat(formData.paidAmount) || 0;
        const remaining = grandTotal - paid;

        setFormData(prev => ({
            ...prev,
            gstAmount: gstAmount,
            totalAmount: grandTotal,
            remainingBalance: remaining
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Auto-fill paid amount if status is set to PAID
            if (name === 'paymentStatus' && value === 'PAID') {
                newState.paidAmount = prev.totalAmount;
            }

            return newState;
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleRazorpayPayment = async (invoice) => {
        try {
            const { data: orderData } = await paymentAPI.createOrder({ invoiceId: invoice.id });
            if (!orderData.success) {
                toast.error('Failed to create payment order');
                return;
            }

            const options = {
                key: orderData.key,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'Atlas Fitness Services IT',
                description: `Invoice Payment #${invoice.invoiceNumber}`,
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        const verifyPayload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            invoiceId: invoice.id
                        };
                        const { data: verifyData } = await paymentAPI.verifyPayment(verifyPayload);
                        if (verifyData.success) {
                            toast.success('Payment Successful!');
                            navigate('/invoices');
                        } else {
                            toast.error('Payment Verification Failed');
                        }
                    } catch (error) {
                        console.error('Payment Verification Error:', error);
                        toast.error('Payment Verification Error');
                    }
                },
                prefill: {
                    name: invoice.member?.name || formData.memberName,
                    email: invoice.member?.email || formData.memberEmail,
                    contact: invoice.member?.phone || formData.memberPhone
                },
                theme: {
                    color: '#3399cc'
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            rzp1.open();

        } catch (error) {
            console.error('Razorpay Error:', error);
            toast.error('Failed to initiate payment');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check validation
            if (!formData.memberId || !formData.planId) {
                toast.error('Please select a valid member and plan');
                setLoading(false);
                return;
            }

            // Calculate Net Amount (Base - Discount)
            const baseAmount = parseFloat(formData.amount) || 0;
            let discountAmount = parseFloat(formData.discount) || 0;
            if (formData.discountType === 'PERCENTAGE') {
                discountAmount = (baseAmount * discountAmount) / 100;
            }
            const netAmount = Math.max(0, baseAmount - discountAmount);

            // Mapping to Backend Schema
            const payload = {
                memberId: formData.memberId,
                planId: formData.planId,
                amount: netAmount, // Send discounted amount
                gstRate: parseFloat(formData.taxRate),
                lateFee: parseFloat(formData.lateFee),
                invoiceNumber: formData.invoiceNumber,
                dueDate: new Date(formData.dueDate || new Date()),
                paymentStatus: formData.paymentMode === 'RAZORPAY' ? 'PENDING' : formData.paymentStatus,
                paidAmount: formData.paymentMode === 'RAZORPAY' ? 0 : parseFloat(formData.paidAmount),
                paymentMethod: formData.paymentMode, // RAZORPAY or CASH
                razorpayPaymentId: formData.transactionId, // Store Transaction ID if manual
                discount: parseFloat(formData.discount),
                discountType: formData.discountType,
                memberGstNumber: formData.memberGstNumber, // Send B2B GST 
                memberPanNumber: formData.memberPanNumber, // Send PAN
                memberAddress: formData.memberAddress, // Send Address
            };

            const response = await invoiceAPI.create(payload);
            const invoice = response.data.invoice;

            if (formData.paymentMode === 'RAZORPAY') {
                await handleRazorpayPayment(invoice);
            } else {
                toast.success('Invoice Created Successfully!');
                navigate('/invoices');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
            {/* LEFT: FORM SECTION */}
            <div className="w-full lg:w-1/2 space-y-6 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">New Invoice</h1>
                    <p className="text-gray-500 text-sm">Create a professional invoice for your members.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Details */}
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Customer Details</h3>
                        <Select
                            label="Select Member"
                            name="memberId"
                            value={formData.memberId}
                            onChange={handleMemberChange}
                            options={members.map(m => ({ value: m.id, label: `${m.name} (${m.memberId})` }))}
                            placeholder="Search Member..."
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Mobile Number" value={formData.memberPhone} readOnly />
                            <Input label="Email" value={formData.memberEmail} readOnly />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Plan *"
                                name="planId"
                                value={formData.planId}
                                onChange={handlePlanChange}
                                options={plans.map(p => ({ value: p.id, label: `${p.name} - ₹${p.price}` }))}
                                required
                            />
                            <Input label="Trainer Name (Optional)" name="trainerName" value={formData.trainerName} onChange={handleChange} placeholder="Enter Name" />
                        </div>
                    </Card>

                    {/* Member Tax & Address Details */}
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Member Tax Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Member's GST Number (Optional)" name="memberGstNumber" value={formData.memberGstNumber} onChange={handleChange} placeholder="Enter GST for B2B Invoice" />
                            <Input label="Member's PAN Number (Optional)" name="memberPanNumber" value={formData.memberPanNumber} onChange={handleChange} placeholder="Enter PAN Number" />
                        </div>
                        <Input label="Member's Address (Optional)" name="memberAddress" value={formData.memberAddress} onChange={handleChange} placeholder="Enter Full Address" />
                    </Card>

                    {/* Invoice Details */}
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Invoice Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Invoice #" value={formData.invoiceNumber} readOnly />
                            <Input label="Invoice Date" type="date" value={formData.invoiceDate} readOnly />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Billing Start" type="date" name="billingStart" value={formData.billingStart} onChange={handleChange} />
                            <Input label="Billing End" type="date" name="billingEnd" value={formData.billingEnd} onChange={handleChange} />
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
                        <Input label="Previous Due (₹)" value={previousDue} readOnly className="bg-red-50 text-red-600 font-bold dark:bg-red-900/20" />

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md text-right border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Final Payable Amount</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(formData.totalAmount)}</p>
                        </div>
                    </Card>

                    {/* Payment Mode */}
                    <Card className="p-4 space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Payment Mode</h3>
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
                            <Input label="Transaction ID / UTR" name="transactionId" value={formData.transactionId} onChange={handleChange} placeholder="Optional" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Payment Status"
                                name="paymentStatus"
                                value={formData.paymentMode === 'RAZORPAY' ? 'PENDING' : formData.paymentStatus}
                                onChange={handleChange}
                                disabled={formData.paymentMode === 'RAZORPAY'}
                                options={[
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'PAID', label: 'Paid' },
                                    { value: 'PARTIAL', label: 'Partial' },
                                    { value: 'OVERDUE', label: 'Overdue' }
                                ]}
                            />
                            <Input
                                label="Paid Amount (₹)"
                                name="paidAmount"
                                type="number"
                                value={formData.paymentMode === 'RAZORPAY' ? 0 : formData.paidAmount}
                                onChange={handleChange}
                                readOnly={formData.paymentMode === 'RAZORPAY'}
                                className={formData.paymentMode === 'RAZORPAY' ? 'opacity-50 cursor-not-allowed' : ''}
                            />
                        </div>
                        <div className="text-right font-semibold text-red-500">
                            Remaining Balance: {formatCurrency(formData.remainingBalance)}
                        </div>
                    </Card>

                    {/* Notes */}
                    <Input label="Notes / Remarks" name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional details..." />

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={handlePrint}>
                            Print / PDF
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>
                            {formData.paymentMode === 'RAZORPAY' ? 'Proceed to Payment' : 'Save Invoice'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* RIGHT: LIVE PREVIEW SECTION */}
            <div className="w-full lg:w-1/2 hidden lg:block">
                <div className="sticky top-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200">Live Preview</h2>
                        {/* Buttons Removed */}
                    </div>

                    {/* A4 PAPER INVOICE */}
                    <div className="bg-white text-black p-8 rounded-lg shadow-lg border border-gray-200 min-h-[800px] text-sm leading-relaxed relative print:w-full print:shadow-none print:border-none print:p-0" id="invoice-preview">

                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-6 mb-6">
                            <div>
                                <img src="/atlas_logo.jpeg" alt="Logo" className="w-40 h-auto object-contain mb-2" />
                                <h1 className="text-3xl font-black uppercase tracking-wide">
                                    <span className="text-black">Atlas Fitness</span> <span className="text-red-600">Elite</span>
                                </h1>
                                <p className="text-gray-500">3-4-98/4/204, New Narsina Nagar, Mallapur, Hyderabad, Telangana 500076</p>
                                <p className="text-gray-500">+91 99882 29441, +91 83175 29757 | info@atlasfitness.com</p>
                                <p className="text-gray-500 font-medium">GSTIN: 36BNEPV0615C1ZA | HSN: 9506</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-gray-700">INVOICE</h2>
                                <p className="text-gray-500">#{formData.invoiceNumber}</p>
                                <p className="mt-2"><span className="font-semibold">Date:</span> {formatDate(formData.invoiceDate)}</p>
                                <p><span className="font-semibold">Due Date:</span> {formData.dueDate ? formatDate(formData.dueDate) : '-'}</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-8">
                            <h3 className="text-gray-600 uppercase text-xs font-bold mb-2">Bill To:</h3>
                            <h2 className="text-xl font-bold">{formData.memberName || 'Member Name'}</h2>
                            <p className="text-gray-600">{formData.memberId}</p>
                            <p className="text-gray-600">{formData.memberPhone}</p>
                            <p className="text-gray-600">{formData.memberEmail}</p>

                            {(formData.memberGstNumber || formData.memberPanNumber) && (
                                <div className="mt-2 text-gray-700">
                                    {formData.memberGstNumber && <p className="font-semibold text-sm">GSTIN: {formData.memberGstNumber}</p>}
                                    {formData.memberPanNumber && <p className="font-semibold text-sm">PAN: {formData.memberPanNumber}</p>}
                                </div>
                            )}

                            {formData.memberAddress && <p className="text-gray-600 mt-1 text-sm">{formData.memberAddress}</p>}
                        </div>

                        {/* Table */}
                        <table className="w-full mb-8">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr className="text-left text-gray-600">
                                    <th className="py-3 px-2">Description</th>
                                    <th className="py-3 px-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 px-2">
                                        <p className="font-semibold">{formData.planName || 'Membership Plan'}</p>
                                        <p className="text-xs text-gray-500">
                                            {formData.billingStart && formData.billingEnd ? `${formatDate(formData.billingStart)} - ${formatDate(formData.billingEnd)}` : 'Billing Period'}
                                        </p>
                                        {formData.trainerName && <p className="text-xs text-blue-600">Trainer: {formData.trainerName}</p>}
                                    </td>
                                    <td className="py-3 px-2 text-right">{formatCurrency(formData.amount || 0)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-1/2 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(formData.amount || 0)}</span>
                                </div>
                                {formData.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount {formData.discountType === 'PERCENTAGE' && `(${formData.discount}%)`}:</span>
                                        <span>- {formatCurrency(formData.discountType === 'PERCENTAGE' ? (formData.amount * formData.discount) / 100 : formData.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax ({formData.taxRate}%):</span>
                                    <span>{formatCurrency(formData.gstAmount)}</span>
                                </div>
                                {formData.lateFee > 0 && (
                                    <div className="flex justify-between text-red-500">
                                        <span>Late Fee:</span>
                                        <span>{formatCurrency(formData.lateFee)}</span>
                                    </div>
                                )}
                                {previousDue > 0 && (
                                    <div className="flex justify-between text-red-600 font-semibold border-t pt-2">
                                        <span>Previous Due:</span>
                                        <span>{formatCurrency(previousDue)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-indigo-900 border-t-2 border-gray-200 pt-2 mt-2">
                                    <span>Total Payable:</span>
                                    <span>{formatCurrency(formData.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700 pt-2">
                                    <span>Paid:</span>
                                    <span>{formatCurrency(formData.paidAmount || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Balance Due:</span>
                                    <span>{formatCurrency(formData.remainingBalance)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Amount in Words Box */}
                        <div className="mt-6 w-full border border-gray-200 bg-gray-50 p-4 rounded-md">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Amount in Words:</p>
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                                {numberToWords(Math.round(formData.totalAmount))}
                            </p>
                        </div>
                    </div>

                    {/* Footer Notes */}
                    <div className="mt-12 pt-6 border-t border-gray-200 text-gray-500 text-xs">
                        <p className="font-semibold mb-1">Notes:</p>
                        <p>{formData.notes || 'Thank you for your business!'}</p>
                        <p className="mt-4 text-center">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInvoice;
