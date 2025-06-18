const express = require('express');
const {
    createDepartment,
    addStaffToDepartment,
    updateHospitalStatus,
    getPatientLog,
    createDoctor,
    getDepartments // Make sure to export this from your controller
} = require('../controllers/hospitalController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection and authorization to all routes in this file
router.use(protect, authorize('hospital'));

// Route for creating a new doctor
router.post('/doctors', createDoctor);

// Routes for managing departments
router.route('/departments')
    .post(createDepartment)
    .get(getDepartments); // Added GET to fetch departments

router.route('/departments/:deptId/staff')
    .post(addStaffToDepartment);

// Route for managing hospital status (beds, ER)
router.route('/status')
    .put(updateHospitalStatus);

// Route for viewing patient history
router.route('/patient-log')
    .get(getPatientLog);

module.exports = router;
