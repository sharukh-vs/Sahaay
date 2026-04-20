const userService = require('./user.service');
const tokenService = require('./token.service');
const authService = require('./auth.service');
const emailService = require('./email.service');
const { matchProviders, scoreSearchResults } = require('./matching.service');

module.exports = {
    userService,
    tokenService,
    authService,
    emailService,
    matchProviders,
    scoreSearchResults,
};