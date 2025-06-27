const express = require('express');
const { getHospitalStatuses, getProfile, updatePassword } = require('../controllers/paramedicController');
const { createPatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// حماية جميع المسارات التالية والتأكد من أن المستخدم هو مسعف
router.use(protect, authorize('paramedic'));

// مسار لجلب حالة المستشفيات للخريطة
router.get('/hospital-statuses', getHospitalStatuses);

// مسارات ملف المسعف الشخصي
router.route('/profile')
    .get(getProfile)
    .put(updatePassword);

// مسار لإنشاء حالة مريض جديدة
router.post('/cases', createPatient);

module.exports = router;
