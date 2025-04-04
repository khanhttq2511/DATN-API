const jwt = require('jsonwebtoken');
const User = require('./models/user.model');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {

            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('decoded', decoded);
            // Get user from the token
            const user = await User.findById(decoded.user ? decoded.user.id : decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
            // console.log('user', user);
            req.user = user;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
