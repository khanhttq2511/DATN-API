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
            
            // Get user from the token
            const user = await User.findById(decoded.user ? decoded.user.id : decoded.id).select('-password');
            if (!user) {
                console.log('User not found with decoded token');
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
            
            req.user = user;

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    } else {
        console.log('No authorization header with Bearer token');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
