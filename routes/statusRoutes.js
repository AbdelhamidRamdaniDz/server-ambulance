const express = require('express');
const {
  getAllHospitalStatuses,
  updateMyHospitalStatus
} = require('../controllers/statusController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('paramedic'), getAllHospitalStatuses);

router.put('/', protect, authorize('hospital'), updateMyHospitalStatus);

module.exports = router;