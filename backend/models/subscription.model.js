const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
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
    planType: {
        type: String,
        enum: ['white_collar', 'blue_collar', 'gray_collar'],
        required: true,
    },
    planName: {
        type: String,
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
    features: [{ type: String }],
    validFrom: {
        type: Date,
        default: Date.now,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending_payment', 'active', 'expired', 'cancelled', 'rejected'],
        default: 'pending_payment',
    },
    // Payment references
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    paidAt: { type: Date, default: null },
    // Invoice
    invoiceNumber: { type: String, default: '' },
    invoiceUrl: { type: String, default: '' },
    // Admin
    approvedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
}, { timestamps: true });

// Plans config (exported for reuse)
const SUBSCRIPTION_PLANS = [
    {
        id: 'white_collar',
        name: 'White Collar Plan',
        collarType: 'white',
        amount: 3000,
        currency: 'INR',
        durationMonths: 12,
        features: [
            'Unlimited service listings',
            'Priority placement in search results',
            'Advanced analytics & reports',
            'Lead management tools',
            'Ads creation (up to 10)',
            'Dedicated support',
            'Customer chat integration',
        ],
    },
    {
        id: 'blue_collar',
        name: 'Blue Collar Plan',
        collarType: 'blue',
        amount: 1500,
        currency: 'INR',
        durationMonths: 12,
        features: [
            'Up to 5 service listings',
            'Standard search placement',
            'Basic analytics',
            'Lead management',
            'Ads creation (up to 3)',
            'Email support',
        ],
    },
    {
        id: 'gray_collar',
        name: 'Gray Collar Plan',
        collarType: 'gray',
        amount: 1000,
        currency: 'INR',
        durationMonths: 12,
        features: [
            'Up to 2 service listings',
            'Basic search placement',
            'Basic analytics',
            'Standard support',
        ],
    },
];

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = { Subscription, SUBSCRIPTION_PLANS };
