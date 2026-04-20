const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    provider: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceProvider',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Service title is required'],
        trim: true,
        maxlength: 150,
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000,
    },
    category: {
        type: String,
        required: true,
    },
    subCategory: {
        type: String,
        default: '',
    },
    // Pricing
    pricingType: {
        type: String,
        enum: ['fixed', 'hourly', 'negotiable', 'quote_based'],
        default: 'quote_based',
    },
    priceMin: {
        type: Number,
        default: 0,
    },
    priceMax: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    // Media
    images: [{ type: String }],
    videos: [{ type: String }],
    documents: [{ type: String }],
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'paused', 'pending_approval', 'rejected'],
        default: 'pending_approval',
    },
    adminNote: {
        type: String,
        default: '',
    },
    // Tags for matching algorithm
    tags: [{ type: String, lowercase: true }],
    // Metrics (for matching)
    viewCount: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    // Special offers
    offer: {
        isActive: { type: Boolean, default: false },
        description: String,
        discountPercent: Number,
        validUntil: Date,
    },
    // Availability override (if different from provider schedule)
    availableOnDemand: { type: Boolean, default: true },
    estimatedDuration: {
        value: Number,
        unit: { type: String, enum: ['hours', 'days', 'weeks'], default: 'hours' },
    },
}, { timestamps: true });

serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ 'offer.isActive': 1, status: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
