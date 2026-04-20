const { StatusCodes } = require('http-status-codes');
const { Dispute, Notification, ServiceProvider } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/** POST /api/disputes */
const createDispute = catchAsync(async (req, res) => {
    const dispute = await Dispute.create({ ...req.body, raisedBy: req.user.id });
    // Notify admins (in production, query admin users)
    res.status(StatusCodes.CREATED).json({ dispute });
});

/** GET /api/disputes */
const getDisputes = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};

    const ADMIN_ROLES = ['superAdmin', 'subAdmin', 'staff', 'helpSupport'];
    if (!ADMIN_ROLES.includes(req.user.role)) {
        filter.raisedBy = req.user.id;
    }
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [disputes, total] = await Promise.all([
        Dispute.find(filter)
            .populate('raisedBy', 'name photo')
            .populate('raisedAgainst', 'name photo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Dispute.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({ disputes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/** GET /api/disputes/:id */
const getDisputeById = catchAsync(async (req, res) => {
    const dispute = await Dispute.findById(req.params.id)
        .populate('raisedBy', 'name photo')
        .populate('raisedAgainst', 'name photo')
        .populate('comments.author', 'name photo');

    if (!dispute) throw new ApiError(StatusCodes.NOT_FOUND, 'Dispute not found');

    const ADMIN_ROLES = ['superAdmin', 'subAdmin', 'staff', 'helpSupport'];
    const canView = dispute.raisedBy._id.toString() === req.user.id || ADMIN_ROLES.includes(req.user.role);
    if (!canView) throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');

    res.status(StatusCodes.OK).json({ dispute });
});

/** PATCH /api/disputes/:id/comment — add comment */
const addComment = catchAsync(async (req, res) => {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) throw new ApiError(StatusCodes.NOT_FOUND, 'Dispute not found');

    dispute.comments.push({ author: req.user.id, text: req.body.text });
    await dispute.save();
    res.status(StatusCodes.OK).json({ dispute });
});

/** PATCH /api/disputes/:id/resolve — admin resolves */
const resolveDispute = catchAsync(async (req, res) => {
    const { resolution, resolutionType, refundAmount } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
        req.params.id,
        { status: 'resolved', resolution, resolutionType, refundAmount, resolvedAt: new Date(), assignedTo: req.user.id },
        { new: true }
    );
    if (!dispute) throw new ApiError(StatusCodes.NOT_FOUND, 'Dispute not found');

    await Notification.create({
        recipient: dispute.raisedBy,
        title: 'Your Dispute Has Been Resolved',
        body: resolution,
        type: 'dispute',
        relatedTo: { model: 'Dispute', id: dispute._id },
    });

    res.status(StatusCodes.OK).json({ dispute });
});

module.exports = { createDispute, getDisputes, getDisputeById, addComment, resolveDispute };
