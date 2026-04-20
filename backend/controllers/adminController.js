const { StatusCodes } = require('http-status-codes');
const { User, ServiceProvider, ServiceRequest, Dispute, Payment, SupportTicket, Ad } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

exports.getDashboardStats = catchAsync(async (req, res) => {
    const [
        totalUsers, totalProviders, totalRequests, activeDisputes,
        openTickets, pendingVerifications, totalRevenueAggr, usersRolesAggr
    ] = await Promise.all([
        User.countDocuments(),
        ServiceProvider.countDocuments(),
        ServiceRequest.countDocuments(),
        Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } }),
        SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
        ServiceProvider.countDocuments({ verificationStatus: 'pending' }),
        Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
    ]);

    const totalRevenue = totalRevenueAggr[0]?.total || 0;
    const usersByRole = usersRolesAggr.map(r => ({ role: r._id, count: r.count }));

    // Revenue by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const revenueAggr = await Payment.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
                amount: { $sum: '$amount' }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    const revenueByDay = revenueAggr.map(r => ({ date: r._id, amount: r.amount }));

    const recentPayments = await Payment.find({ status: 'paid' }).sort({ paidAt: -1 }).limit(5);

    res.status(StatusCodes.OK).json({
        stats: {
            totalUsers, totalProviders, totalRequests, activeDisputes, openTickets, pendingVerifications, totalRevenue
        },
        usersByRole,
        revenueByDay,
        recentPayments
    });
});

exports.getUsers = catchAsync(async (req, res) => {
    const { q, role, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ];
    }
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';

    const [users, total] = await Promise.all([
        User.find(filter).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 }),
        User.countDocuments(filter)
    ]);

    res.status(StatusCodes.OK).json({ users, total, pages: Math.ceil(total / Number(limit)) });
});

exports.updateUser = catchAsync(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(StatusCodes.OK).json({ user });
});

exports.getProviders = catchAsync(async (req, res) => {
    const { q, verificationStatus, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.businessName = { $regex: q, $options: 'i' };
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const [providers, total] = await Promise.all([
        ServiceProvider.find(filter).populate('user', 'name email').skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 }),
        ServiceProvider.countDocuments(filter)
    ]);

    res.status(StatusCodes.OK).json({ providers, total, pages: Math.ceil(total / Number(limit)) });
});

exports.verifyProvider = catchAsync(async (req, res) => {
    const { status, rejectionReason } = req.body;
    const provider = await ServiceProvider.findByIdAndUpdate(
        req.params.id,
        { verificationStatus: status, ...(rejectionReason && { rejectionReason }) },
        { new: true }
    );
    res.status(StatusCodes.OK).json({ provider });
});

exports.getDisputes = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [disputes, total] = await Promise.all([
        Dispute.find(filter).populate('raisedBy raisedAgainst', 'name email').skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 }),
        Dispute.countDocuments(filter)
    ]);

    res.status(StatusCodes.OK).json({ disputes, total, pages: Math.ceil(total / Number(limit)) });
});

exports.getPayments = catchAsync(async (req, res) => {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const [payments, total, totalRevenueAggr] = await Promise.all([
        Payment.find(filter).populate('user', 'name email').skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 }),
        Payment.countDocuments(filter),
        Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    res.status(StatusCodes.OK).json({
        payments, total, pages: Math.ceil(total / Number(limit)), totalRevenue: totalRevenueAggr[0]?.total || 0
    });
});

exports.getAds = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const [ads, total] = await Promise.all([
        Ad.find(filter).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).sort({ createdAt: -1 }),
        Ad.countDocuments(filter)
    ]);

    res.status(StatusCodes.OK).json({ ads, total, pages: Math.ceil(total / Number(limit)) });
});

exports.createAd = catchAsync(async (req, res) => {
    const ad = await Ad.create(req.body);
    res.status(StatusCodes.CREATED).json({ ad });
});

exports.updateAd = catchAsync(async (req, res) => {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(StatusCodes.OK).json({ ad });
});

exports.deleteAd = catchAsync(async (req, res) => {
    await Ad.findByIdAndDelete(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
});
