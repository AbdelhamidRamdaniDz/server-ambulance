const Hospital = require('../models/Hospital');
const Paramedic = require('../models/Paramedic');
const SuperAdmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    user.password = undefined;
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: user 
        });
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور والدور' });
        }

        let Model;
        if (role === 'hospital') Model = Hospital;
        else if (role === 'paramedic') Model = Paramedic;
        else if (role === 'super-admin') Model = SuperAdmin;
        else return res.status(400).json({ success: false, message: 'الدور المحدد غير صالح' });

        const user = await Model.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }
        
        sendTokenResponse(user, 200, res);

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "خطأ في الخادم" });
    }
};

exports.logout = (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, data: {} });
};

exports.getMe = async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
};