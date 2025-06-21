const express = require('express');
// ✅ تم إضافة deleteUser هنا
const { createUser, getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// يمكنك تفعيل هذه الأسطر لاحقًا لحماية جميع المسارات
// router.use(protect, authorize('super-admin'));

router.route('/users')
    .post(createUser)
    .get(getUsers);

// ✅ تم إضافة هذا المسار الجديد للتعامل مع الحذف والتعديل
router.route('/users/:id')
    .delete(deleteUser);
    // .put(updateUser); // يمكنك إضافة هذا لاحقًا للتعديل

module.exports = router;
