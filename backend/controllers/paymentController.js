const { StatusCodes } = require('http-status-codes');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment, Quotation, Subscription, ServiceRequest, Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, 'Payment gateway not configured');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

/** POST /api/payments/initiate */
const initiatePayment = catchAsync(async (req, res) => {
    const { type, relatedId, amount, currency = 'INR' } = req.body;
    if (!type || !relatedId || !amount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'type, relatedId, and amount are required');
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: `sahaay_${type}_${Date.now()}`,
        notes: { userId: req.user.id, type, relatedId },
    });

    // Determine model type for relatedTo
    const modelMap = { advance: 'Quotation', final: 'Quotation', subscription: 'Subscription', ad: 'Ad' };

    const payment = await Payment.create({
        user: req.user.id,
        type,
        relatedTo: { model: modelMap[type] || 'Quotation', id: relatedId },
        amount,
        currency,
        razorpayOrderId: order.id,
        description: `Sahaay ${type} payment`,
    });

    res.status(StatusCodes.CREATED).json({
        payment,
        order,
        key: process.env.RAZORPAY_KEY_ID,
        prefill: {
            name: req.user.name,
            email: req.user.email,
            contact: req.user.phone || '',
        },
    });
});

/** POST /api/payments/verify — Razorpay webhook / frontend verify */
const verifyPayment = catchAsync(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentDbId } = req.body;

    // Verify signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    if (expectedSignature !== razorpaySignature) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment verification failed: invalid signature');
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
        paymentDbId,
        {
            razorpayPaymentId,
            razorpaySignature,
            status: 'paid',
            paidAt: new Date(),
        },
        { new: true }
    );
    if (!payment) throw new ApiError(StatusCodes.NOT_FOUND, 'Payment record not found');

    // Post-payment actions
    if (payment.type === 'advance' || payment.type === 'final') {
        const quotation = await Quotation.findById(payment.relatedTo.id);
        if (quotation) {
            if (payment.type === 'advance') {
                quotation.advancePaid = true;
                quotation.advancePaymentId = payment._id;
                await quotation.save();
                // Move request to in_progress
                await ServiceRequest.findByIdAndUpdate(quotation.request, { status: 'in_progress' });
            } else {
                quotation.finalPaymentId = payment._id;
                await quotation.save();
                await ServiceRequest.findByIdAndUpdate(quotation.request, { status: 'completed', completedAt: new Date() });
            }
            // Notify provider
            await Notification.create({
                recipient: (await require('../models').ServiceProvider.findById(quotation.provider))?.user,
                title: `Payment ${payment.type === 'advance' ? 'Advance' : 'Final'} Received ₹${payment.amount}`,
                body: 'Your payment has been processed successfully.',
                type: 'payment',
                relatedTo: { model: 'Quotation', id: quotation._id },
            }).catch(() => {});
        }
    } else if (payment.type === 'subscription') {
        await Subscription.findByIdAndUpdate(payment.relatedTo.id, {
            paymentStatus: 'paid',
            paidAt: new Date(),
            razorpayPaymentId,
            status: 'active',
        });
    }

    res.status(StatusCodes.OK).json({ payment, message: 'Payment verified successfully' });
});

/** GET /api/payments/history */
const getPaymentHistory = catchAsync(async (req, res) => {
    const { type, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    if (type) filter.type = type;

    const [payments, total] = await Promise.all([
        Payment.find(filter).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)),
        Payment.countDocuments(filter),
    ]);
    res.status(StatusCodes.OK).json({ payments, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

/** GET /api/subscriptions/plans */
const getSubscriptionPlans = catchAsync(async (req, res) => {
    const { SUBSCRIPTION_PLANS } = require('../models/subscription.model');
    res.status(StatusCodes.OK).json({ plans: SUBSCRIPTION_PLANS });
});

/** POST /api/subscriptions */
const createSubscription = catchAsync(async (req, res) => {
    const { planId } = req.body;
    const { SUBSCRIPTION_PLANS, Subscription } = require('../models/subscription.model');
    const { ServiceProvider } = require('../models');

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid plan');

    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider profile not found');

    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + plan.durationMonths);

    const subscription = await Subscription.create({
        provider: provider._id,
        user: req.user.id,
        planType: plan.id,
        planName: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        features: plan.features,
        validUntil,
        status: 'pending_payment',
    });

    res.status(StatusCodes.CREATED).json({ subscription });
});

/** GET /api/subscriptions/me */
const getMySubscription = catchAsync(async (req, res) => {
    const { Subscription } = require('../models/subscription.model');
    const { ServiceProvider } = require('../models');
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider not found');

    const subscription = await Subscription.findOne({
        provider: provider._id,
        status: 'active',
        validUntil: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({ subscription });
});

module.exports = { initiatePayment, verifyPayment, getPaymentHistory, getSubscriptionPlans, createSubscription, getMySubscription };
