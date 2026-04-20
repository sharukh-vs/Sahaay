const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceProvider',
        default: null,
    },
    type: {
        type: String,
        enum: ['advance', 'final', 'subscription', 'ad'],
        required: true,
    },
    relatedTo: {
        model: {
            type: String,
            enum: ['ServiceRequest', 'Quotation', 'Subscription', 'Ad'],
        },
        id: { type: mongoose.SchemaTypes.ObjectId },
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    // Razorpay
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'created',
    },
    paidAt: { type: Date, default: null },
    // Refund
    refundId: { type: String, default: null },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date, default: null },
    refundReason: { type: String, default: '' },
    // Invoice
    invoiceNumber: { type: String, default: '' },
    description: { type: String, default: '' },
}, { timestamps: true });

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
