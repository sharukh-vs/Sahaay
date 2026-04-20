const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceProvider',
        required: true,
    },
    request: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'ServiceRequest',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
        maxlength: 1000,
        default: '',
    },
    // Detailed ratings
    qualityRating: { type: Number, min: 1, max: 5 },
    punctualityRating: { type: Number, min: 1, max: 5 },
    communicationRating: { type: Number, min: 1, max: 5 },
    valueRating: { type: Number, min: 1, max: 5 },
    // Status
    isVisible: { type: Boolean, default: true },
    isEdited: { type: Boolean, default: false },
    adminNote: { type: String, default: '' },
    // Provider response
    providerResponse: { type: String, default: '' },
    providerRespondedAt: { type: Date, default: null },
}, { timestamps: true });

feedbackSchema.index({ provider: 1, isVisible: 1 });
feedbackSchema.index({ user: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
