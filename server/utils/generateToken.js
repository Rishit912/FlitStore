const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {

    // create a id card for user

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // token valid for 30 days
    });

    // store token in a secure cookie (httpOnly, secure, sameSite)

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development', // only send cookie over https in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
};
module.exports = generateToken;