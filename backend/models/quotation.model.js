const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    request: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceRequest',
        required: true,
    },
    provider: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceProvider',
        required: true,
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    description: {
        type: String,
        maxlength: 1000,
    },
    breakdownItems: [{
        item: String,
        cost: Number,
    }],
    estimatedDuration: {
        value: Number,
        unit: { type: String, enum: ['hours', 'days', 'weeks'], default: 'hours' },
    },
    advanceAmount: {
        type: Number,
        default: 0,
    },
    advancePaid: {
        type: Boolean,
        default: false,
    },
    advancePaymentId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Payment',
        default: null,
    },
    finalPaymentId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Payment',
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired', 'withdrawn'],
        default: 'pending',
    },
    validUntil: {
        type: Date,
        default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
    rejectionReason: { type: String, default: '' },
}, { timestamps: true });

quotationSchema.index({ request: 1, provider: 1 });
quotationSchema.index({ user: 1, status: 1 });

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
