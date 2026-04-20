const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [
            'service_request', 'quotation', 'payment', 'subscription',
            'dispute', 'feedback', 'ticket', 'system', 'ad', 'community',
        ],
        default: 'system',
    },
    relatedTo: {
        model: String,
        id: { type: mongoose.SchemaTypes.ObjectId },
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
        default: null,
    },
    channels: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true },
    },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
