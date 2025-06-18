const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');


router.use(protect, authorize('super-admin'));

// @desc    Render the main admin dashboard page
router.get('/dashboard', (req, res) => {
    res.render('admin-dashboard', { user: req.user });
});

// @desc    Render the form to create a new user
router.get('/create-user-form', (req, res) => {
    const { role } = req.query;
    if (!['hospital', 'paramedic'].includes(role)) {
        return res.status(400).send('Invalid role specified');
    }
    res.render('create-user-form', { role });
});

module.exports = router;
