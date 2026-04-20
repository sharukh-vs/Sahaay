const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    raisedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    raisedAgainst: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        default: null,
    },
    request: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceRequest',
        default: null,
    },
    quotation: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Quotation',
        default: null,
    },
    type: {
        type: String,
        enum: ['service_quality', 'payment', 'no_show', 'fraud', 'other'],
        required: true,
    },
    subject: {
        type: String,
        required: true,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000,
    },
    evidence: [{ type: String }], // file URLs
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'closed', 'escalated'],
        default: 'open',
    },
    resolution: {
        type: String,
        default: '',
    },
    resolutionType: {
        type: String,
        enum: ['refund', 'no_action', 'warning', 'ban', 'other', ''],
        default: '',
    },
    refundAmount: { type: Number, default: 0 },
    assignedTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        default: null,
    },
    resolvedAt: { type: Date, default: null },
    // Activity log
    comments: [{
        author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const Dispute = mongoose.model('Dispute', disputeSchema);
module.exports = Dispute;
