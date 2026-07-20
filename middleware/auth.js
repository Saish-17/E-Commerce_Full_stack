const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luxe_retail_jwt_secret_token_key_12938!');
        
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid or expired.' });
    }
};
