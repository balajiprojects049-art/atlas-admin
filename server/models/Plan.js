const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // in months
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    gstRate: {
        type: Number,
        default: 18, // 18% GST
    },
    description: String,
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Plan', planSchema);
