const { StatusCodes } = require('http-status-codes');
const { ServiceRequest, Notification } = require('../models');
const { matchProviders } = require('../services/matching.service');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const notifyProviders = async (request, matchedProviders) => {
    const notifs = matchedProviders.slice(0, 10).map((mp) =>
        Notification.create({
            recipient: mp.provider.user,
            title: 'New Service Request Matches You',
            body: `A client posted a "${request.category}" request that matches your profile.`,
            type: 'service_request',
            relatedTo: { model: 'ServiceRequest', id: request._id },
        }).catch(() => {})
    );
    await Promise.all(notifs);
};

/** POST /api/requests */
const createRequest = catchAsync(async (req, res) => {
    const request = await ServiceRequest.create({ ...req.body, user: req.user.id });

    // Run matching algorithm async (non-blocking for response)
    matchProviders(request).then(async (matched) => {
        if (matched.length) {
            request.matchedProviders = matched.map((m) => ({
                provider: m.provider._id,
                matchScore: m.matchScore,
                notified: false,
            }));
            await request.save();
            await notifyProviders(request, matched);
            await ServiceRequest.findByIdAndUpdate(request._id, {
                'matchedProviders.$[].notified': true,
            });
        }
    }).catch((err) => console.warn('[Matching] Error:', err.message));

    res.status(StatusCodes.CREATED).json({ request });
});

/** GET /api/requests — role-filtered */
const getRequests = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === 'user') {
        filter.user = req.user.id;
    } else if (req.user.role === 'serviceProvider') {
        const { ServiceProvider } = require('../models');
        const provider = await ServiceProvider.findOne({ user: req.user.id });
        if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');
        filter['matchedProviders.provider'] = provider._id;
        filter.isPublic = true;
    }
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
        ServiceRequest.find(filter)
            .populate('user', 'name photo address.city')
            .populate('assignedProvider', 'businessName averageRating')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        ServiceRequest.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({ requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/** GET /api/requests/:id */
const getRequestById = catchAsync(async (req, res) => {
    const request = await ServiceRequest.findById(req.params.id)
        .populate('user', 'name photo address.city')
        .populate('assignedProvider')
        .populate('matchedProviders.provider', 'businessName averageRating profileImage');

    if (!request) throw new ApiError(StatusCodes.NOT_FOUND, 'Request not found');

    // Access control
    const isOwner = request.user._id.toString() === req.user.id;
    const { ServiceProvider } = require('../models');
    const provider = req.user.role === 'serviceProvider'
        ? await ServiceProvider.findOne({ user: req.user.id })
        : null;
    const isMatchedProvider = provider && request.matchedProviders?.some(
        (mp) => mp.provider._id?.toString() === provider._id.toString()
    );
    const isAdmin = ['superAdmin', 'subAdmin', 'staff'].includes(req.user.role);

    if (!isOwner && !isMatchedProvider && !isAdmin) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');
    }

    res.status(StatusCodes.OK).json({ request });
});

/** PATCH /api/requests/:id/status */
const updateRequestStatus = catchAsync(async (req, res) => {
    const { status, cancelReason } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) throw new ApiError(StatusCodes.NOT_FOUND, 'Request not found');

    const isOwner = request.user.toString() === req.user.id;
    if (!isOwner) throw new ApiError(StatusCodes.FORBIDDEN, 'Only the requester can update status');

    request.status = status;
    if (status === 'cancelled') { request.cancelledAt = new Date(); request.cancelReason = cancelReason || ''; }
    if (status === 'completed') request.completedAt = new Date();
    await request.save();

    res.status(StatusCodes.OK).json({ request });
});

/** PUT /api/requests/:id */
const updateRequest = catchAsync(async (req, res) => {
    const request = await ServiceRequest.findOne({ _id: req.params.id, user: req.user.id, status: 'open' });
    if (!request) throw new ApiError(StatusCodes.NOT_FOUND, 'Request not found or cannot be edited');

    const forbidden = ['user', 'status', 'matchedProviders', 'assignedProvider'];
    forbidden.forEach((f) => delete req.body[f]);
    Object.assign(request, req.body);
    await request.save();
    res.status(StatusCodes.OK).json({ request });
});

/** DELETE /api/requests/:id */
const deleteRequest = catchAsync(async (req, res) => {
    const request = await ServiceRequest.findOneAndDelete({ _id: req.params.id, user: req.user.id, status: 'open' });
    if (!request) throw new ApiError(StatusCodes.NOT_FOUND, 'Cannot delete this request');
    res.status(StatusCodes.NO_CONTENT).send();
});

/** GET /api/requests/open — public open requests (for providers) */
const getOpenRequests = catchAsync(async (req, res) => {
    const { category, page = 1, limit = 12 } = req.query;
    const filter = { status: 'open', isPublic: true };
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

    // Hide user contact details
    const sanitized = requests.map((r) => {
        const obj = r.toObject();
        if (obj.user) { delete obj.user.email; delete obj.user.phone; }
        return obj;
    });

    res.status(StatusCodes.OK).json({ requests: sanitized, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

module.exports = { createRequest, getRequests, getRequestById, updateRequestStatus, updateRequest, deleteRequest, getOpenRequests };
