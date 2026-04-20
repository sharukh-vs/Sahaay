const { StatusCodes } = require('http-status-codes');
const { Service, ServiceProvider } = require('../models');
const { matchProviders, scoreSearchResults } = require('../services/matching.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** GET /api/services — list/search services */
const getServices = catchAsync(async (req, res) => {
    const {
        q, category, city, minPrice, maxPrice,
        rating, sort = 'popular', page = 1, limit = 12,
    } = req.query;

    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };
    if (minPrice || maxPrice) {
        filter.priceMin = { $lte: Number(maxPrice) || 999999 };
        filter.priceMax = { $gte: Number(minPrice) || 0 };
    }

    let sortObj = {};
    if (sort === 'popular') sortObj = { requestCount: -1, viewCount: -1 };
    else if (sort === 'rating') sortObj = { averageRating: -1 };
    else if (sort === 'price_asc') sortObj = { priceMin: 1 };
    else if (sort === 'price_desc') sortObj = { priceMin: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [services, total] = await Promise.all([
        Service.find(filter)
            .populate('provider', 'businessName averageRating totalRatings location businessAddress collarType profileImage categories')
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit)),
        Service.countDocuments(filter),
    ]);

    // Increment view counts (non-blocking)
    Service.updateMany({ _id: { $in: services.map((s) => s._id) } }, { $inc: { viewCount: 1 } }).catch(() => {});

    res.status(StatusCodes.OK).json({
        services,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
    });
});

/** GET /api/services/:id */
const getServiceById = catchAsync(async (req, res) => {
    const service = await Service.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1 } },
        { new: true }
    ).populate('provider', '-bankDetails -razorpayContactId -razorpayFundAccountId');

    if (!service || service.status !== 'active') {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found');
    }
    res.status(StatusCodes.OK).json({ service });
});

/** GET /api/services/categories */
const getCategories = catchAsync(async (req, res) => {
    const { SERVICE_CATEGORIES } = require('../models/serviceProvider.model');
    const categoryCounts = await Service.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);
    const categories = SERVICE_CATEGORIES.map((cat) => ({
        name: cat,
        count: categoryCounts.find((c) => c._id === cat)?.count || 0,
    }));
    res.status(StatusCodes.OK).json({ categories });
});

/** GET /api/services/providers/search — provider search with matching algorithm */
const searchProviders = catchAsync(async (req, res) => {
    const { category, lat, lng, q, page = 1, limit = 12 } = req.query;
    let providers = await ServiceProvider.find({
        isActive: true,
        isVerified: true,
        verificationStatus: 'approved',
        ...(category && { categories: category }),
    }).limit(100);

    // Text search filter
    if (q) {
        const qLower = q.toLowerCase();
        providers = providers.filter(
            (p) =>
                p.businessName.toLowerCase().includes(qLower) ||
                p.businessDescription?.toLowerCase().includes(qLower) ||
                p.categories?.some((c) => c.toLowerCase().includes(qLower))
        );
    }

    // Score and sort
    const coordinates = lat && lng ? [parseFloat(lng), parseFloat(lat)] : null;
    const scored = await scoreSearchResults(providers, { category, coordinates });

    const skip = (Number(page) - 1) * Number(limit);
    const paginated = scored.slice(skip, skip + Number(limit));

    res.status(StatusCodes.OK).json({
        providers: paginated,
        total: scored.length,
        page: Number(page),
        pages: Math.ceil(scored.length / Number(limit)),
    });
});

/** GET /api/services/providers/:id — public provider profile */
const getProviderProfile = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findById(req.params.id)
        .populate('user', 'name photo createdAt')
        .select('-bankDetails -razorpayContactId -razorpayFundAccountId -businessPhone -businessEmail');

    if (!provider || !provider.isActive) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
    }

    const services = await Service.find({ provider: provider._id, status: 'active' });
    const { Feedback } = require('../models');
    const reviews = await Feedback.find({ provider: provider._id, isVisible: true })
        .populate('user', 'name photo')
        .sort({ createdAt: -1 })
        .limit(10);

    res.status(StatusCodes.OK).json({ provider, services, reviews });
});

/** POST /api/services — provider creates a service listing */
const createService = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');

    const service = await Service.create({ ...req.body, provider: provider._id });
    res.status(StatusCodes.CREATED).json({ service });
});

/** PUT /api/services/:id — provider updates their listing */
const updateService = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    const service = await Service.findOne({ _id: req.params.id, provider: provider._id });
    if (!service) throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found');

    Object.assign(service, req.body);
    await service.save();
    res.status(StatusCodes.OK).json({ service });
});

/** PATCH /api/services/:id/status */
const updateServiceStatus = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    const service = await Service.findOneAndUpdate(
        { _id: req.params.id, provider: provider?._id },
        { status: req.body.status },
        { new: true }
    );
    if (!service) throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found');
    res.status(StatusCodes.OK).json({ service });
});

/** DELETE /api/services/:id */
const deleteService = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    await Service.findOneAndDelete({ _id: req.params.id, provider: provider?._id });
    res.status(StatusCodes.NO_CONTENT).send();
});

module.exports = {
    getServices, getServiceById, getCategories, searchProviders,
    getProviderProfile, createService, updateService, updateServiceStatus, deleteService,
};
