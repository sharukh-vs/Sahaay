const { DateTime } = require('luxon')
const jwt = require('jsonwebtoken')
const { Token } = require('../models')
const { tokenTypes } = require('../config/tokens')

const saveToken = async (token, userId, tokenType, expireDate, blacklisted=false) => {
    const tokenData = await Token.create({
        token,
        user: userId,
        type: tokenType,
        expires: expireDate,
        blacklisted
    })

    return tokenData;
}

const generateToken = (userId, expires, secret = process.env.ACCESS_TOKEN_SECRET) => {
    const payload = {
        sub: userId,
        iat: Math.floor(DateTime.now().toSeconds()),
        exp: Math.floor(expires.toSeconds())
    }

    return jwt.sign(payload, secret);
}

const generateAuthToken = async (user) => {
    const accessTokenExpiresInMinutes = Number(process.env.ACCESS_TOKEN_EXPIRES);
    const accessTokenExpires = DateTime.now().plus({minutes: accessTokenExpiresInMinutes});
    const accessToken = generateToken(user.id, accessTokenExpires);

    const refreshTokenExpiresInDays = Number(process.env.REFRESH_TOKEN_EXPIRES);
    const refreshTokenExpires = DateTime.now().plus({days: refreshTokenExpiresInDays});
    const refreshToken = generateToken(user.id, refreshTokenExpires);
    await saveToken(refreshToken, user.id, tokenTypes.REFRESH, refreshTokenExpires);
    return {
        access : {
            token: accessToken,
            expires: accessTokenExpires.toISO({includeOffset: false}),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toISO({includeOffset: false}),
        },
        user: {
            id: user.id
        }
    }
}

module.exports = {
    generateAuthToken,

}