const { StatusCodes } = require('http-status-codes');
const { Feedback, ServiceProvider, ServiceRequest } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const createFeedback = catchAsync(async (req, res) => {
    const { providerId, requestId, rating, review, qualityRating, punctualityRating, communicationRating, valueRating } = req.body;
    const request = await ServiceRequest.findById(requestId);
    if (!request || request.user.toString() !== req.user.id || request.status !== 'completed') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Can only review completed service requests');
    }
    const existing = await Feedback.findOne({ user: req.user.id, request: requestId });
    if (existing) throw new ApiError(StatusCodes.CONFLICT, 'You already reviewed this service');

    const feedback = await Feedback.create({ user: req.user.id, provider: providerId, request: requestId, rating, review, qualityRating, punctualityRating, communicationRating, valueRating });

    const allFeedback = await Feedback.find({ provider: providerId, isVisible: true });
    const avg = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    await ServiceProvider.findByIdAndUpdate(providerId, {
        averageRating: Math.round(avg * 10) / 10,
        totalRatings: allFeedback.length,
        $inc: { totalJobsCompleted: 1 },
    });
    res.status(StatusCodes.CREATED).json({ feedback });
});

const getProviderFeedback = catchAsync(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [feedback, total] = await Promise.all([
        Feedback.find({ provider: req.params.providerId, isVisible: true })
            .populate('user', 'name photo').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Feedback.countDocuments({ provider: req.params.providerId, isVisible: true }),
    ]);
    const allRatings = await Feedback.find({ provider: req.params.providerId, isVisible: true }).select('rating');
    const breakdown = [5, 4, 3, 2, 1].map((r) => ({ stars: r, count: allRatings.filter((f) => f.rating === r).length }));
    res.status(StatusCodes.OK).json({ feedback, total, breakdown, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

const providerRespond = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    const feedback = await Feedback.findOne({ _id: req.params.id, provider: provider?._id });
    if (!feedback) throw new ApiError(StatusCodes.NOT_FOUND, 'Feedback not found');
    feedback.providerResponse = req.body.response;
    feedback.providerRespondedAt = new Date();
    await feedback.save();
    res.status(StatusCodes.OK).json({ feedback });
});

const getMyFeedback = catchAsync(async (req, res) => {
    const feedback = await Feedback.find({ user: req.user.id })
        .populate('provider', 'businessName profileImage').sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({ feedback });
});

module.exports = { createFeedback, getProviderFeedback, providerRespond, getMyFeedback };
