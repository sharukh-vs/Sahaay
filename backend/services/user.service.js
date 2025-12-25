const { User } = require('../models') 
const { StatusCodes } = require('http-status-codes')
const ApiError = require('../utils/ApiError')

const createUser = async (userBody) => {
    if(await User.isEmailTaken(userBody.email) ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
    }

    return User.create(userBody)
}

module.exports = {
    createUser
}