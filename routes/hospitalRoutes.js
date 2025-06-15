const express = require('express');
const {
    createDepartment,
    addStaffToDepartment,
    updateHospitalStatus,
    getPatientLog
} = require('../controllers/hospitalController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('hospital'));

router.route('/departments')
    .post(createDepartment);

router.route('/departments/:deptId/staff')
    .post(addStaffToDepartment);

router.route('/status')
    .put(updateHospitalStatus);

router.route('/patient-log')
    .get(getPatientLog);


module.exports = router;
