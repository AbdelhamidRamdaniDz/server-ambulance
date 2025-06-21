const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Department = require('../models/Department');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

router.use(protect, authorize('hospital'));

router.get('/dashboard', (req, res) => {
    res.render('hospital-dashboard', { user: req.user });
});

router.get('/status', (req, res) => {
    res.render('update-status');
});

router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.id });
        res.render('manage-departments', { departments, error: req.query.error, success: req.query.success });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

router.get('/patient-log', async (req, res) => {
    try {
        const patients = await Patient.find({ assignedHospital: req.user.id });
        res.render('patient-log', { patients });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

router.get('/schedule', async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.id }).populate('staff.doctor', 'fullName');
        
        const totalActiveStaff = departments.reduce((sum, dept) => sum + dept.activeStaffCount, 0);
        const totalStaff = departments.reduce((sum, dept) => sum + dept.staff.length, 0);
        const availabilityPercentage = totalStaff > 0 ? Math.round((totalActiveStaff / totalStaff) * 100) : 0;
        
        res.render('hospital-schedule', { 
            user: req.user,
            departments,
            totalActiveStaff,
            totalStaff,
            availabilityPercentage
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// @desc    Render the page to create and view doctors
// @route   GET /hospital-panel/create-doctor
router.get('/create-doctor', async (req, res) => {
    try {
        const doctors = await Doctor.find({ hospital: req.user.id });

        res.render('create-doctor', {
            user: req.user,
            doctors,
            error: req.query.error,
            success: req.query.success
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});


// عرض صفحة إضافة طاقم لقسم
// @desc    Render the page to add staff to a department
// @route   GET /hospital-panel/add-staff
router.get('/add-staff', async (req, res) => {
    try {

        const departments = await Department.find({ hospital: req.user.id })
            .populate('staff.doctor', 'fullName'); 

        const doctors = await Doctor.find({ hospital: req.user.id });

        res.render('add-staff', {
            user: req.user,
            departments,
            doctors,
            error: req.query.error,
            success: req.query.success
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});


// @desc    Render the detail page for a single department
// @route   GET /hospital-panel/departments/:id
router.get('/departments/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('staff.doctor', 'fullName');

        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).send('Department not found or not authorized');
        }

        res.render('department-detail', { department });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// @desc    Render the page to edit a staff member in a department
// @route   GET /hospital-panel/departments/:deptId/staff/:staffId/edit
router.get('/departments/:deptId/staff/:staffId/edit', async (req, res) => {
    try {
        const department = await Department.findById(req.params.deptId)
            .populate('staff.doctor', 'fullName');

        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).send('Department not found');
        }

        const staffMember = department.staff.id(req.params.staffId);
        if (!staffMember) {
            return res.status(404).send('Staff member not found');
        }

        res.render('edit-staff-member', { department, staffMember });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;