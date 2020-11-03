const express = require('express');
const { register, login, getMe } = require('../controllers/auth');

const router = express.Router();

//add protect middleware to get user.id
const { protect } = require('../middleware/auth');

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/me').get(protect, getMe);
// router.get('/me', protect, getMe);

module.exports = router;
