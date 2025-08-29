const userService = require('../services/userService');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        const decoded = userService.verifyToken(token);
        const user = await userService.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {});
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin role required.' 
            });
        }
        
        next();
    } catch (error) {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied.' 
        });
    }
};

module.exports = { auth, adminAuth };
