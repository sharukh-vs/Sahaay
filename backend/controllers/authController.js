const User = require('../models/user.model')
const { StatusCodes } = require('http-status-codes')
const { userService, tokenService, authService } = require('../services')
const catchAsync = require('../utils/catchAsync')

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthToken(user);
    res.status(StatusCodes.CREATED).send({ user, tokens });
})

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthToken(user);
    res.status(StatusCodes.OK).send({ user, tokens });
})

module.exports = {
    register,
    login,
}