const express = require('express');
const { 
    getIncomingRequests,
    acceptRequest,
    treatRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('hospital'));

router.get('/incoming', getIncomingRequests);
router.put('/:id/accept', acceptRequest);
router.put('/:id/treat', treatRequest);

module.exports = router;