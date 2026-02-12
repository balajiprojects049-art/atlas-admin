import { format, addMonths, differenceInDays, parseISO } from 'date-fns';

// Date formatting
export const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

// Currency formatting
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

// Membership ID generation
export const generateMemberID = (count) => {
    const paddedCount = String(count + 1).padStart(4, '0');
    return `MEM-${paddedCount}`;
};

// Invoice number generation
export const generateInvoiceNumber = (count) => {
    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(4, '0');
    return `INV-${year}-${paddedCount}`;
};

// Calculate membership end date
export const calculateEndDate = (startDate, planDuration) => {
    if (!startDate || !planDuration) return null;
    return addMonths(new Date(startDate), planDuration);
};

// Calculate days until expiry
export const daysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    return differenceInDays(new Date(endDate), new Date());
};

// Check if membership is expiring soon (within 7 days)
export const isExpiringSoon = (endDate) => {
    const days = daysUntilExpiry(endDate);
    return days !== null && days >= 0 && days <= 7;
};

// Check if membership is expired
export const isExpired = (endDate) => {
    const days = daysUntilExpiry(endDate);
    return days !== null && days < 0;
};

// Get membership status
export const getMembershipStatus = (endDate) => {
    if (isExpired(endDate)) return 'expired';
    if (isExpiringSoon(endDate)) return 'expiring';
    return 'active';
};

// Calculate late fee (₹50 per day after 7 days)
export const calculateLateFee = (dueDate) => {
    const daysPastDue = -differenceInDays(new Date(dueDate), new Date());
    if (daysPastDue <= 7) return 0;
    return (daysPastDue - 7) * 50;
};

// Calculate GST
export const calculateGST = (amount, rate = 18) => {
    const gstAmount = (amount * rate) / 100;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const total = amount + gstAmount;

    return {
        baseAmount: amount,
        gstRate: rate,
        gstAmount,
        cgst,
        sgst,
        totalAmount: total,
    };
};

// Get payment status badge class
export const getPaymentStatusClass = (status) => {
    switch (status) {
        case 'paid':
            return 'badge-success';
        case 'pending':
            return 'badge-warning';
        case 'overdue':
            return 'badge-danger';
        default:
            return 'badge-info';
    }
};

// Get membership status badge class
export const getMembershipStatusClass = (status) => {
    switch (status) {
        case 'active':
            return 'badge-success';
        case 'expiring':
            return 'badge-warning';
        case 'expired':
            return 'badge-danger';
        default:
            return 'badge-info';
    }
};

// Validate email
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validate phone number (Indian format)
export const isValidPhone = (phone) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
};

// Truncate text
export const truncate = (text, length = 50) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};
