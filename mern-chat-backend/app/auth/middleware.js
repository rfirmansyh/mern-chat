const config = require('../config');
const User = require('../users/model');
const jwt = require('jsonwebtoken');
const { getToken } = require('../utils/get-token')



function decodeToken() {
    return async function(req, res, next) {
        try {
            let token = getToken(req);
            if (!token) return next();

            req.user = jwt.verify(token, config.secretKey)
            let user = User.findOne({ token: {$in: [token]} });

            if (!user) {
                return res.json({
                    error: 1,
                    message: 'Token Expired'
                })
            }
        } catch (err) {
            if (err && err.name === 'JsonWebTokenError') {
                return res.json({
                    error: 1,
                    message: err.message
                });
            }
            next(err);
        }
        return next();
    }
}

module.exports = {
    decodeToken
}