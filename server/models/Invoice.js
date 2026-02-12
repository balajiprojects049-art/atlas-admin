const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    gstAmount: Number,
    cgst: Number,
    sgst: Number,
    lateFee: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending', 'overdue'],
        default: 'pending',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    paidDate: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentMethod: String, // UPI, Card, NetBanking, Cash
}, {
    timestamps: true,
});

module.exports = mongoose.model('Invoice', invoiceSchema);
