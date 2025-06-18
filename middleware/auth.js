const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const SuperAdmin = require('../models/SuperAdmin');

exports.protect = async (req, res, next) => {
  let token;

  // 1. تحقق من وجود التوكن في الكوكيز (لطلبات المتصفح)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. أو تحقق من هيدر الطلب (لتطبيق الموبايل)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // إذا لم يتم العثور على توكن، أعد التوجيه لصفحة الدخول
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'doctor') req.user = await Doctor.findById(decoded.id);
    else if (decoded.role === 'hospital') req.user = await Hospital.findById(decoded.id);
    else if (decoded.role === 'super-admin') req.user = await SuperAdmin.findById(decoded.id);
    
    if (!req.user) return res.redirect('/login');
    
    req.user.role = decoded.role;
    next();
  } catch (err) {
    return res.redirect('/login');
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('<h1>Access Denied</h1><p>You are not authorized to view this page.</p>');
    }
    next();
  };
};
