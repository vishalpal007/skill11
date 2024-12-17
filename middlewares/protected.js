const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../modles/authModle/User');

// Middleware to check authentication token
exports.protected = asyncHandler(async (req, res, next) => {
    let token = req.cookies.auth;
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, no token provided' });
    }

    try {
        if (!process.env.JWT_KEY) {
            throw new Error('JWT_KEY is not set in environment');
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        try {
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Error fetching user from DB:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid/expired token' });
    }
});
