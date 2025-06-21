const express = require('express');
const { login } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, (req, res) => {
    res.json({
      success: true,
      user: {
        email: req.user.email,
        role: req.user.role,
        displayName: req.user.displayName,
      },
    });
  });
module.exports = router;