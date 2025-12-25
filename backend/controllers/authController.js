const User = require('../models/user.model')
const { StatusCodes } = require('http-status-codes')
const { userService, tokenService } = require('../services')
const catchAsync = require('../utils/catchAsync')

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthToken(user);
    res.status(StatusCodes.CREATED).send({ user, tokens });
})

module.exports = {
    register,
}