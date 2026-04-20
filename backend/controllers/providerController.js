const { StatusCodes } = require('http-status-codes');
const { ServiceProvider, Service, ServiceRequest, Quotation, Payment, Feedback } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** GET /api/provider/dashboard */
const getDashboard = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found. Please complete onboarding.');

    const [
        totalServices,
        totalQuotes,
        pendingQuotes,
        acceptedQuotes,
        totalPaymentsResult,
        recentRequests,
        recentFeedback,
    ] = await Promise.all([
        Service.countDocuments({ provider: provider._id }),
        Quotation.countDocuments({ provider: provider._id }),
        Quotation.countDocuments({ provider: provider._id, status: 'pending' }),
        Quotation.countDocuments({ provider: provider._id, status: 'accepted' }),
        Payment.aggregate([
            { $match: { provider: provider._id, status: 'paid', type: { $in: ['advance', 'final'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        ServiceRequest.find({
            'matchedProviders.provider': provider._id,
            status: { $in: ['open', 'quoted'] },
        }).populate('user', 'name photo address.city').sort({ createdAt: -1 }).limit(5),
        Feedback.find({ provider: provider._id, isVisible: true })
            .populate('user', 'name photo').sort({ createdAt: -1 }).limit(3),
    ]);

    const totalEarnings = totalPaymentsResult[0]?.total || 0;

    res.status(StatusCodes.OK).json({
        provider,
        stats: {
            totalServices,
            totalQuotes,
            pendingQuotes,
            acceptedQuotes,
            totalEarnings,
            completionRate: provider.completionRate || 100,
            averageRating: provider.averageRating || 0,
            totalRatings: provider.totalRatings || 0,
            totalJobsCompleted: provider.totalJobsCompleted || 0,
            responseTime: provider.responseTime || 0,
        },
        recentRequests,
        recentFeedback,
        subscription: provider.activeSubscription,
    });
});

/** GET /api/provider/profile */
const getProviderProfile = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');
    res.status(StatusCodes.OK).json({ provider });
});

/** PUT /api/provider/profile */
const updateProviderProfile = catchAsync(async (req, res) => {
    const forbidden = ['user', 'isVerified', 'verificationStatus', 'averageRating', 'totalRatings', 'completionRate'];
    forbidden.forEach((f) => delete req.body[f]);

    const provider = await ServiceProvider.findOneAndUpdate(
        { user: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
    );
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');
    res.status(StatusCodes.OK).json({ provider });
});

/** POST /api/provider/onboard — creates provider profile */
const onboardProvider = catchAsync(async (req, res) => {
    const existing = await ServiceProvider.findOne({ user: req.user.id });
    if (existing) throw new ApiError(StatusCodes.CONFLICT, 'Provider profile already exists');

    const provider = await ServiceProvider.create({
        ...req.body,
        user: req.user.id,
        isActive: true,
        verificationStatus: 'pending',
        isVerified: false,
    });
    res.status(StatusCodes.CREATED).json({ provider });
});

/** GET /api/provider/services */
const getMyServices = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { provider: provider._id };
    if (status) filter.status = status;

    const services = await Service.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    const total = await Service.countDocuments(filter);
    res.status(StatusCodes.OK).json({ services, total });
});

/** GET /api/provider/requests — matched requests feed */
const getMatchedRequests = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');

    const { category, page = 1, limit = 12 } = req.query;
    const filter = {
        'matchedProviders.provider': provider._id,
        status: { $in: ['open', 'quoted'] },
        isPublic: true,
    };
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
        ServiceRequest.find(filter)
            .populate('user', 'name photo address.city')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        ServiceRequest.countDocuments(filter),
    ]);

    // Attach match scores
    const withScores = requests.map((r) => {
        const mp = r.matchedProviders.find(
            (m) => m.provider.toString() === provider._id.toString()
        );
        return { ...r.toObject(), myMatchScore: mp?.matchScore || 0 };
    });

    res.status(StatusCodes.OK).json({ requests: withScores, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/** GET /api/provider/quotes */
const getMyQuotes = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { provider: provider._id };
    if (status) filter.status = status;

    const [quotations, total] = await Promise.all([
        Quotation.find(filter)
            .populate('request', 'title category status address budgetMin budgetMax preferredDate')
            .populate('user', 'name photo')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit)),
        Quotation.countDocuments(filter),
    ]);
    res.status(StatusCodes.OK).json({ quotations, total });
});

/** GET /api/provider/earnings */
const getEarnings = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');

    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate = new Date();
    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const payments = await Payment.find({
        provider: provider._id,
        status: 'paid',
        type: { $in: ['advance', 'final'] },
        paidAt: { $gte: startDate },
    }).sort({ paidAt: 1 });

    const totalEarned = payments.reduce((sum, p) => sum + p.amount, 0);

    // Group by day for chart
    const byDay = {};
    payments.forEach((p) => {
        const day = p.paidAt.toISOString().split('T')[0];
        byDay[day] = (byDay[day] || 0) + p.amount;
    });

    res.status(StatusCodes.OK).json({
        payments,
        totalEarned,
        chartData: Object.entries(byDay).map(([date, amount]) => ({ date, amount })),
        period,
    });
});

/** PATCH /api/provider/availability */
const updateAvailability = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOneAndUpdate(
        { user: req.user.id },
        { availability: req.body.availability },
        { new: true }
    );
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');
    res.status(StatusCodes.OK).json({ availability: provider.availability });
});

/** PATCH /api/provider/profile-image */
const updateProfileImage = catchAsync(async (req, res) => {
    if (!req.file) throw new ApiError(StatusCodes.BAD_REQUEST, 'No file uploaded');
    const imageUrl = `/uploads/images/${req.file.filename}`;
    const provider = await ServiceProvider.findOneAndUpdate(
        { user: req.user.id },
        { profileImage: imageUrl },
        { new: true }
    );
    res.status(StatusCodes.OK).json({ profileImage: imageUrl, provider });
});

module.exports = {
    getDashboard, getProviderProfile, updateProviderProfile, onboardProvider,
    getMyServices, getMatchedRequests, getMyQuotes, getEarnings,
    updateAvailability, updateProfileImage,
};
