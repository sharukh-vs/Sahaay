const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    raisedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
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
    category: {
        type: String,
        enum: ['account', 'payment', 'service', 'ad', 'subscription', 'technical', 'other'],
        default: 'other',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open',
    },
    attachments: [{ type: String }],
    assignedTo: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        default: null,
    },
    messages: [{
        sender: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
        text: String,
        attachments: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
    }],
    resolvedAt: { type: Date, default: null },
    ticketNumber: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate ticket number
supportTicketSchema.pre('save', function (next) {
    if (!this.ticketNumber) {
        this.ticketNumber = 'TKT-' + Date.now().toString(36).toUpperCase();
    }
    next();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
module.exports = SupportTicket;
