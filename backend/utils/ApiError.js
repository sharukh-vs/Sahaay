class ApiError extends Error {
    constructor(statuscode, message, isOperational = true, stack = '') {
        super(message);
        this.statuscode = statuscode;
        this.isOperational = isOperational;
        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;