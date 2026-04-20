const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Request title is required'],
        maxlength: 200,
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
    tags: [{ type: String, lowercase: true }],
    // Location
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: { type: [Number], default: [0, 0] },
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
    },
    // Budget
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    // Scheduling
    preferredDate: { type: Date, default: null },
    preferredTimeSlot: { type: String, default: '' },
    isFlexible: { type: Boolean, default: true },
    // Status lifecycle:
    // open -> quoted -> accepted -> in_progress -> completed | cancelled | disputed
    status: {
        type: String,
        enum: ['open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'],
        default: 'open',
    },
    // Assigned provider (after quote accepted)
    assignedProvider: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceProvider',
        default: null,
    },
    acceptedQuotation: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Quotation',
        default: null,
    },
    // Media attachments
    images: [{ type: String }],
    // Visibility
    isPublic: { type: Boolean, default: true },
    // Matched providers (set by matching algorithm)
    matchedProviders: [{
        provider: { type: mongoose.SchemaTypes.ObjectId, ref: 'ServiceProvider' },
        matchScore: Number,
        notified: { type: Boolean, default: false },
    }],
    // Timestamps
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
}, { timestamps: true });

serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ category: 1, status: 1 });
serviceRequestSchema.index({ user: 1, status: 1 });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
