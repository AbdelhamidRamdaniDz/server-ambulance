const express = require('express');
// Import the entire controller object instead of destructuring
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// router.use(protect);
// router.use(authorize('super-admin'));


router.route('/users')
    .post(adminController.createUser)
    .get(adminController.getUsers);

// router.route('/users/:id')
//     .put(adminController.updateUser)
//     .delete(adminController.deleteUser);

module.exports = router;
