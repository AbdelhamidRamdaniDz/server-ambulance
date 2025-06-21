const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');
const Paramedic = require('../models/Paramedic');
const SuperAdmin = require('../models/SuperAdmin');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول إلى هذا المسار' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let Model;
        if (decoded.role === 'hospital') Model = Hospital;
        else if (decoded.role === 'paramedic') Model = Paramedic;
        else if (decoded.role === 'super-admin') Model = SuperAdmin;
        else {
             return res.status(401).json({ success: false, message: 'توكن غير صالح، الدور غير معروف' });
        }

        req.user = await Model.findById(decoded.id);
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'المستخدم المرتبط بهذا التوكن لم يعد موجودًا' });
        }
        
        req.user.role = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'غير مصرح لك بالوصول، فشل التحقق من التوكن' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `الدور '${req.user.role}' غير مصرح له بالوصول إلى هذا المسار` 
            });
        }
        next();
    };
};
