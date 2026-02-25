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

// Convert number to words (Indian Rupee format)
export const numberToWords = (num) => {
    if (num === 0) return 'Zero Rupees Only';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if ((n = n.toString()).length > 9) return 'overflow';
        let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!nArray) return;
        let str = '';
        str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
        str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
        str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
        str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
        str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
        return str.trim();
    };

    const strNum = num.toString().split('.');
    let rupees = inWords(parseInt(strNum[0]));
    let paise = '';

    if (strNum[1] && parseInt(strNum[1]) > 0) {
        // Handle up to 2 decimal places
        const decimalPart = strNum[1].padEnd(2, '0').substring(0, 2);
        paise = ' and ' + inWords(parseInt(decimalPart)) + ' Paise';
    }

    return rupees + ' Rupees' + paise + ' Only';
};
