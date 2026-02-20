const { User } = require('../models') 
const { StatusCodes } = require('http-status-codes')
const ApiError = require('../utils/ApiError')

const createUser = async (userBody) => {
    if(await User.isEmailTaken(userBody.email) ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
    }

    return User.create(userBody)
}

const getUserById = async (id) => {
    return await User.findById(id);
}

const getUserByEmail = async (email) => {
    return await User.findOne({ email }).select("+password");
}
module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
}