const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Department = require('../models/Department');
const Patient = require('../models/Patient');

router.use(protect, authorize('hospital'));

router.get('/dashboard', (req, res) => {
    res.render('hospital-dashboard', { user: req.user });
});

router.get('/status', (req, res) => {
    res.render('update-status');
});

router.get('/departments', async (req, res) => {
    const departments = await Department.find({ hospital: req.user.id });
    res.render('manage-departments', { departments });
});

router.get('/patient-log', async (req, res) => {
    const patients = await Patient.find({ assignedHospital: req.user.id });
    res.render('patient-log', { patients });
});


module.exports = router;
