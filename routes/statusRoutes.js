// File: routes/statusRoutes.js (ملف جديد)
const express = require('express');
const {
  getAllHospitalStatuses,
  updateMyHospitalStatus
} = require('../controllers/statusController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route for paramedics to get all statuses
router.get('/', protect, authorize('paramedic'), getAllHospitalStatuses);

// Route for hospitals to update their own status
router.put('/', protect, authorize('hospital'), updateMyHospitalStatus);

module.exports = router;