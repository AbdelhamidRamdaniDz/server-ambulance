const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const SuperAdmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');

// @desc    Login for any role
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).send('<h1>Error</h1><p>Please provide all fields</p><a href="/login">Go Back</a>');
    }

    let Model;
    if (role === 'doctor') Model = Doctor;
    else if (role === 'hospital') Model = Hospital;
    else if (role === 'super-admin') Model = SuperAdmin;
    else return res.status(400).send('<h1>Error</h1><p>Invalid Role</p><a href="/login">Go Back</a>');

    try {
        const user = await Model.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).send('<h1>Error</h1><p>Invalid Credentials</p><a href="/login">Go Back</a>');
        }
        sendTokenResponse(user, role, 200, res);
    } catch (error) {
        res.status(500).send('<h1>Server Error</h1>');
    }
};

// Helper function to set cookie and redirect
const sendTokenResponse = (user, role, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true // Secure against client-side script access
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true; // Only send over HTTPS in production
  }
  
  // Set the cookie and then redirect to the appropriate dashboard
  res.status(statusCode).cookie('token', token, options);
  
  if (role === 'super-admin') {
      return res.redirect('/admin/dashboard');
  }
   if (role === 'hospital') {
      return res.redirect('/hospital-panel/dashboard');
  }
  // Fallback for other roles (e.g., if a doctor logs in via a non-browser client)
   res.json({ success: true, token });
};
