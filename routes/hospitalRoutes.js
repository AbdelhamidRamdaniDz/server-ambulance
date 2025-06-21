const express = require('express');
const {
    createDepartment,
    getDepartments,
    updateDepartment,
    addStaffToDepartment,
    removeStaffFromDepartment,
    updateHospitalStatus,
    getPatientLog,
    createDoctor,
    updateStaffMember,
    getAllDoctors,
    getDepartmentById
} = require('../controllers/hospitalController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// تطبيق الحماية والصلاحيات على جميع المسارات في هذا الملف
router.use(protect, authorize('hospital'));

// مسار لإنشاء طبيب جديد
router.post('/doctors', createDoctor);
router.get('/doctors', getAllDoctors);

// مسارات لإدارة الأقسام
router.route('/departments')
    .post(createDepartment)
    .get(getDepartments);

router.route('/departments/:id')
    .get(getDepartmentById) 
    .put(updateDepartment);

// مسارات لإدارة الطاقم الطبي في قسم معين
router.route('/departments/:deptId/staff')
    .post(addStaffToDepartment);

router.route('/departments/:deptId/staff/:staffId')
    .put(updateStaffMember)
    .delete(removeStaffFromDepartment);

// مسار لإدارة حالة المستشفى (الأسرة، الطوارئ)
router.route('/status')
  .put(updateHospitalStatus);

// مسار لعرض سجل المرضى
router.route('/patient-log')
    .get(getPatientLog);

module.exports = router;
