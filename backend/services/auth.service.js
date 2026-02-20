const { StatusCodes } = require('http-status-codes')
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');

const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    if(!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect Email or Password');
    }
    return user;

}

module.exports = {
    loginUserWithEmailAndPassword,
}