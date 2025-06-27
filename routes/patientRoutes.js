const express = require('express');
const { createPatient, getPatientById, updatePatientStatus } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, authorize('paramedic'), createPatient);
router.route('/:id').get(protect, authorize('paramedic', 'hospital'), getPatientById);
router.route('/:id/status').put(protect, authorize('hospital'), updatePatientStatus);

module.exports = router;

