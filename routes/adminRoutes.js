const express = require('express');
const { createUser, getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/users')
    .post(createUser)
    .get(getUsers);

router.route('/users/:id')
    .delete(deleteUser);

module.exports = router;
