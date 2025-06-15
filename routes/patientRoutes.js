const express = require('express');
const { createPatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('doctor'), createPatient);

module.exports = router;