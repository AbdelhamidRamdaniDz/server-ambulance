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

router.use(protect, authorize('hospital'));

router.post('/doctors', createDoctor);
router.get('/doctors', getAllDoctors);

router.route('/departments')
    .post(createDepartment)
    .get(getDepartments);

router.route('/departments/:id')
    .get(getDepartmentById) 
    .put(updateDepartment);

router.route('/departments/:deptId/staff')
    .post(addStaffToDepartment);

router.route('/departments/:deptId/staff/:staffId')
    .put(updateStaffMember)
    .delete(removeStaffFromDepartment);

router.route('/status')
  .put(updateHospitalStatus);

router.route('/patient-log')
    .get(getPatientLog);

module.exports = router;
