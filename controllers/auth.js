//import ErrorResponse
const ErrorResponse = require('../middleware/error');
//Import asyncHandler
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Register user
// @route   GET /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
	//destructure name, email, password & role from req.body
	const { name, email, password, role } = req.body;

	//create a user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	res.status(200).json({ success: true });
});
