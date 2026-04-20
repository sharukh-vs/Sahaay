const { StatusCodes } = require('http-status-codes');
const { SupportTicket } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const ADMIN_ROLES = ['superAdmin', 'subAdmin', 'staff', 'helpSupport'];

const createTicket = catchAsync(async (req, res) => {
    const ticket = await SupportTicket.create({ ...req.body, raisedBy: req.user.id });
    res.status(StatusCodes.CREATED).json({ ticket });
});

const getTickets = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = ADMIN_ROLES.includes(req.user.role) ? {} : { raisedBy: req.user.id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
        SupportTicket.find(filter).populate('raisedBy', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        SupportTicket.countDocuments(filter),
    ]);
    res.status(StatusCodes.OK).json({ tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

const getTicketById = catchAsync(async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id)
        .populate('raisedBy', 'name email photo')
        .populate('messages.sender', 'name photo role');
    if (!ticket) throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
    const canView = ticket.raisedBy._id.toString() === req.user.id || ADMIN_ROLES.includes(req.user.role);
    if (!canView) throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');
    res.status(StatusCodes.OK).json({ ticket });
});

const addMessage = catchAsync(async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
    ticket.messages.push({ sender: req.user.id, text: req.body.text, attachments: req.body.attachments || [] });
    if (ticket.status === 'closed') ticket.status = 'open';
    await ticket.save();
    res.status(StatusCodes.OK).json({ ticket });
});

const updateTicketStatus = catchAsync(async (req, res) => {
    if (!ADMIN_ROLES.includes(req.user.role)) throw new ApiError(StatusCodes.FORBIDDEN, 'Admins only');
    const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status, assignedTo: req.user.id, ...(req.body.status === 'resolved' && { resolvedAt: new Date() }) },
        { new: true }
    );
    if (!ticket) throw new ApiError(StatusCodes.NOT_FOUND, 'Ticket not found');
    res.status(StatusCodes.OK).json({ ticket });
});

module.exports = { createTicket, getTickets, getTicketById, addMessage, updateTicketStatus };
