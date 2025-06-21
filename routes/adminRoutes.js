const express = require('express');
const { createUser, getUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// يمكنك تفعيل هذه الأسطر لاحقًا لحماية جميع المسارات
// router.use(protect, authorize('super-admin'));

router.route('/users')
    .post(createUser)
    .get(getUsers);

module.exports = router;
