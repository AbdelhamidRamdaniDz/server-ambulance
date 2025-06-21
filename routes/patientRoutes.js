const express = require('express');
const { createPatient, getPatientById } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, authorize('paramedic'), createPatient);
router.route('/:id').get(protect, authorize('paramedic', 'hospital', 'doctor'), getPatientById);

module.exports = router;
