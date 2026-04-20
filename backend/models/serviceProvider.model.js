const mongoose = require('mongoose');

const SERVICE_CATEGORIES = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
    'Landscaping', 'HVAC', 'Roofing', 'Flooring', 'Appliance Repair',
    'Pest Control', 'Security Systems', 'Interior Design', 'Moving',
    'Photography', 'Catering', 'Event Management', 'Tutoring',
    'Medical', 'Legal', 'Accounting', 'IT Support', 'Tailoring',
    'Beauty & Wellness', 'Automotive', 'Other',
];

const COLLAR_TYPES = ['white', 'blue', 'gray'];

const serviceProviderSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
    },
    businessDescription: {
        type: String,
        maxlength: 1000,
        default: '',
    },
    categories: [{
        type: String,
        enum: SERVICE_CATEGORIES,
    }],
    collarType: {
        type: String,
        enum: COLLAR_TYPES,
        required: true,
    },
    // Contact & Location
    businessPhone: {
        type: String,
        required: true,
    },
    businessEmail: {
        type: String,
        lowercase: true,
    },
    businessAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' },
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },
    serviceRadius: {
        type: Number,  // in kilometers
        default: 10,
    },
    // Verification & Status
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // Documents / Credentials
    documents: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
    }],
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date,
        url: String,
    }],
    // Profile media
    profileImage: { type: String, default: '' },
    portfolioImages: [{ type: String }],
    // Subscription
    activeSubscription: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Subscription',
        default: null,
    },
    // Ratings (denormalized for performance)
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    totalJobsCompleted: {
        type: Number,
        default: 0,
    },
    // Availability
    availability: {
        monday: { open: Boolean, from: String, to: String },
        tuesday: { open: Boolean, from: String, to: String },
        wednesday: { open: Boolean, from: String, to: String },
        thursday: { open: Boolean, from: String, to: String },
        friday: { open: Boolean, from: String, to: String },
        saturday: { open: Boolean, from: String, to: String },
        sunday: { open: Boolean, from: String, to: String },
    },
    // Matching score fields
    responseTime: {
        type: Number,   // average hours to respond
        default: 24,
    },
    completionRate: {
        type: Number,   // percentage 0-100
        default: 100,
    },
    // Bank details (for payouts)
    bankDetails: {
        accountHolder: { type: String, select: false },
        accountNumber: { type: String, select: false },
        ifsc: { type: String, select: false },
        bankName: { type: String, select: false },
    },
    // Razorpay
    razorpayContactId: { type: String, select: false },
    razorpayFundAccountId: { type: String, select: false },
}, { timestamps: true });

serviceProviderSchema.index({ location: '2dsphere' });
serviceProviderSchema.index({ categories: 1, 'verificationStatus': 1, isActive: 1 });

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);

module.exports = { ServiceProvider, SERVICE_CATEGORIES, COLLAR_TYPES };
