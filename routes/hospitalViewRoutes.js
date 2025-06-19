const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// استيراد النماذج اللازمة لجلب البيانات
const Department = require('../models/Department');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// حماية جميع المسارات في هذا الملف
router.use(protect, authorize('hospital'));

// عرض لوحة التحكم الرئيسية
router.get('/dashboard', (req, res) => {
    res.render('hospital-dashboard', { user: req.user });
});

// عرض صفحة تحديث الحالة
router.get('/status', (req, res) => {
    res.render('update-status');
});

// عرض صفحة إدارة الأقسام
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.id });
        res.render('manage-departments', { departments, error: req.query.error, success: req.query.success });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// عرض سجل المرضى
router.get('/patient-log', async (req, res) => {
    try {
        const patients = await Patient.find({ assignedHospital: req.user.id });
        res.render('patient-log', { patients });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// عرض صفحة جدول المناوبات
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

// --- تم التعديل هنا ---
// @desc    Render the page to create and view doctors
// @route   GET /hospital-panel/create-doctor
router.get('/create-doctor', async (req, res) => {
    try {
        // جلب قائمة الأطباء التابعين لهذا المستشفى فقط
        const doctors = await Doctor.find({ hospital: req.user.id });

        res.render('create-doctor', {
            user: req.user,
            doctors, // تمرير قائمة الأطباء إلى الواجهة
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
            .populate('staff.doctor', 'fullName'); // جلب اسم الطبيب

        if (!department || department.hospital.toString() !== req.user.id) {
            return res.status(404).send('Department not found or not authorized');
        }

        res.render('department-detail', { department });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
