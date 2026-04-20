const { StatusCodes } = require('http-status-codes');
const { Quotation, ServiceRequest, ServiceProvider, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** POST /api/quotations — provider submits quote */
const createQuotation = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');

    const request = await ServiceRequest.findById(req.body.requestId);
    if (!request || request.status !== 'open') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Request is not open for quotes');
    }

    // Check duplicate quote
    const existing = await Quotation.findOne({ request: request._id, provider: provider._id, status: 'pending' });
    if (existing) throw new ApiError(StatusCodes.CONFLICT, 'You already submitted a quote for this request');

    const quotation = await Quotation.create({
        request: request._id,
        provider: provider._id,
        user: request.user,
        amount: req.body.amount,
        description: req.body.description,
        breakdownItems: req.body.breakdownItems,
        estimatedDuration: req.body.estimatedDuration,
        advanceAmount: req.body.advanceAmount || 0,
    });

    // Update request status
    if (request.status === 'open') {
        await ServiceRequest.findByIdAndUpdate(request._id, { status: 'quoted' });
    }

    // Notify user
    await Notification.create({
        recipient: request.user,
        title: 'New Quote Received',
        body: `${provider.businessName} sent a quote of ₹${req.body.amount} for your request.`,
        type: 'quotation',
        relatedTo: { model: 'Quotation', id: quotation._id },
    });

    res.status(StatusCodes.CREATED).json({ quotation });
});

/** GET /api/quotations/request/:requestId — user gets all quotes on their request */
const getQuotationsByRequest = catchAsync(async (req, res) => {
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) throw new ApiError(StatusCodes.NOT_FOUND, 'Request not found');
    if (request.user.toString() !== req.user.id) throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');

    const quotations = await Quotation.find({ request: req.params.requestId })
        .populate('provider', 'businessName averageRating totalRatings profileImage categories collarType')
        .sort({ amount: 1 });

    res.status(StatusCodes.OK).json({ quotations });
});

/** PATCH /api/quotations/:id/accept — user accepts a quote */
const acceptQuotation = catchAsync(async (req, res) => {
    const quotation = await Quotation.findById(req.params.id).populate('provider');
    if (!quotation) throw new ApiError(StatusCodes.NOT_FOUND, 'Quotation not found');

    const request = await ServiceRequest.findById(quotation.request);
    if (!request || request.user.toString() !== req.user.id) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');
    }
    if (request.status !== 'quoted') {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Request is not in quotation stage');
    }

    // Accept this, reject others
    await Quotation.updateMany({ request: quotation.request, _id: { $ne: quotation._id } }, { status: 'rejected' });
    quotation.status = 'accepted';
    await quotation.save();

    // Update request
    request.status = 'accepted';
    request.assignedProvider = quotation.provider._id;
    request.acceptedQuotation = quotation._id;
    await request.save();

    // Notify provider
    await Notification.create({
        recipient: quotation.provider.user,
        title: 'Your Quote Was Accepted! 🎉',
        body: `The client accepted your quote of ₹${quotation.amount}.`,
        type: 'quotation',
        relatedTo: { model: 'Quotation', id: quotation._id },
    });

    res.status(StatusCodes.OK).json({ quotation, request });
});

/** PATCH /api/quotations/:id/reject — user rejects a quote */
const rejectQuotation = catchAsync(async (req, res) => {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) throw new ApiError(StatusCodes.NOT_FOUND, 'Quotation not found');

    const request = await ServiceRequest.findById(quotation.request);
    if (request?.user.toString() !== req.user.id) throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');

    quotation.status = 'rejected';
    quotation.rejectionReason = req.body.reason || '';
    await quotation.save();

    res.status(StatusCodes.OK).json({ quotation });
});

/** GET /api/quotations/me — provider sees their submitted quotes */
const getMyQuotations = catchAsync(async (req, res) => {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');

    const { status, page = 1, limit = 10 } = req.query;
    const filter = { provider: provider._id };
    if (status) filter.status = status;

    const quotations = await Quotation.find(filter)
        .populate('request', 'title category status location')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    res.status(StatusCodes.OK).json({ quotations });
});

/** GET /api/quotations/my — user sees all quotes received on their requests */
const getMyUserQuotations = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 30 } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const [quotations, total] = await Promise.all([
        Quotation.find(filter)
            .populate('provider', 'businessName averageRating totalRatings profileImage collarType totalJobsCompleted')
            .populate('request', 'title category status')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit)),
        Quotation.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({ quotations, total });
});

module.exports = { createQuotation, getQuotationsByRequest, acceptQuotation, rejectQuotation, getMyQuotations, getMyUserQuotations };
