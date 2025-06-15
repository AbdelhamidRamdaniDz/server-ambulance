const express = require('express');
const router = express.Router();

// @desc    Render the main admin dashboard page
// @route   GET /admin/dashboard
router.get('/dashboard', (req, res) => {
    res.render('admin-dashboard');
});

// @desc    Render the form to create a new user (hospital or paramedic)
// @route   GET /admin/create-user-form
router.get('/create-user-form', (req, res) => {
    const { role } = req.query;
    if (!['hospital', 'paramedic'].includes(role)) {
        return res.status(400).send('Invalid role specified');
    }
    res.render('create-user-form', { role });
});

module.exports = router;
