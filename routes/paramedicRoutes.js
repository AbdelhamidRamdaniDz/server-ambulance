const express = require('express');
const { getHospitalStatusesForParamedic } = require('../controllers/hospitalController');
const { createPatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// حماية جميع المسارات التالية والتأكد من أن المستخدم هو مسعف
router.use(protect, authorize('paramedic'));

// مسار لجلب حالة المستشفيات للخريطة
router.get('/hospital-statuses', getHospitalStatusesForParamedic);

// مسار لإنشاء حالة مريض جديدة
router.post('/cases', createPatient);


module.exports = router;
