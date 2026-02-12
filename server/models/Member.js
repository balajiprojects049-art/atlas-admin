const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    dob: Date,
    address: String,
    photo: String,
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
    },
    planStartDate: Date,
    planEndDate: Date,
    status: {
        type: String,
        enum: ['active', 'expired', 'pending'],
        default: 'active',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Member', memberSchema);
