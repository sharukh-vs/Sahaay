const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    provider: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceProvider',
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxlength: 150,
    },
    description: {
        type: String,
        maxlength: 500,
    },
    adType: {
        type: String,
        enum: ['banner', 'card', 'popup', 'notification'],
        default: 'banner',
    },
    category: { type: String, required: true },
    // Media
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    callToAction: { type: String, default: '' },
    targetUrl: { type: String, default: '' },
    // Targeting
    targetAudience: {
        location: { type: String, default: '' },
        categories: [{ type: String }],
        ageRange: {
            min: { type: Number, default: 18 },
            max: { type: Number, default: 65 },
        },
    },
    // Scheduling
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Status
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'active', 'paused', 'expired', 'rejected'],
        default: 'pending_approval',
    },
    adminNote: { type: String, default: '' },
    // Performance metrics
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    // Subscription plan for this ad
    adSubscription: {
        planId: { type: String, default: '' },
        amount: { type: Number, default: 0 },
        impressionLimit: { type: Number, default: 0 },
        clickLimit: { type: Number, default: 0 },
    },
    paymentId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Payment',
        default: null,
    },
}, { timestamps: true });

const Ad = mongoose.model('Ad', adSchema);
module.exports = Ad;
