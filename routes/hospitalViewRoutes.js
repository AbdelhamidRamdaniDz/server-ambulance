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
        res.render('manage-departments', { departments, error: req.query.error });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// عرض صفحة سجل المرضى
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
        const departments = await Department.find({ hospital: req.user.id }).populate('staff.doctor', 'firstName lastName');
        const totalActiveStaff = departments.reduce((sum, dept) => sum + dept.activeStaffCount, 0);
        const totalStaff = departments.reduce((sum, dept) => sum + dept.staff.length, 0);
        const availabilityPercentage = totalStaff > 0 ? Math.round((totalActiveStaff / totalStaff) * 100) : 0;
        
        res.render('hospital-schedule', { 
            user: req.user,
            departments,
            totalActiveStaff,
            availabilityPercentage
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// عرض صفحة إضافة طبيب جديد
router.get('/create-doctor', (req, res) => {
    res.render('create-doctor', {
        user: req.user,
        error: req.query.error,
        success: req.query.success
    });
});

// عرض صفحة إضافة طاقم لقسم
router.get('/add-staff', async (req, res) => {
    try {
        const departments = await Department.find({ hospital: req.user.id });
        const doctors = await Doctor.find({ hospital: req.user.id }); // Only doctors of this hospital
        res.render('add-staff', {
            user: req.user,
            departments,
            doctors,
            error: req.query.error
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;
