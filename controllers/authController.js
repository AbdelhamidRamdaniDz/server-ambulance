const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const SuperAdmin = require('../models/SuperAdmin'); 
const jwt = require('jsonwebtoken');

// @desc    Login for Super Admin ONLY
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, error: 'Please provide email, password, and role' });
        }

        if (role !== 'super-admin') {
            return res.status(403).json({ success: false, error: 'Login is restricted to Super Admins only.' });
        }

        const user = await SuperAdmin.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        sendTokenResponse(user, role, 200, res);

    } catch (error) {
        res.status(500).json({ success: false, error: "Server Error" });
    }
};

const sendTokenResponse = (user, role, statusCode, res) => {
  const token = user.getSignedJwtToken(); 

  user.password = undefined;
  if(role === 'super-admin') {
      return res.redirect(`/admin/dashboard`);
  }
  
  return res.status(statusCode).json({
    success: true,
    token,
    user 
  });
};
