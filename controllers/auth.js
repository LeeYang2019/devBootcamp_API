//import ErrorResponse
const ErrorResponse = require('../utils/errorResponse');

//Import asyncHandler
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/v1/auth/register
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

	// create token
	const token = user.getSignedJwtToken();

	res.status(200).json({ success: true, token });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	//validate email and password
	if (!email || !password)
		return next(
			new ErrorResponse(`Please provide an email and/or passowrd`, 400)
		);

	//check for user
	const user = await User.findOne({ email }).select('+password');

	if (!user) return next(new ErrorResponse(`Invalid credentials`, 401));

	//check if password matches
	const isMatched = await user.matchPassword(password);

	if (!isMatched) return next(new ErrorResponse(`Invalid credentails`, 401));

	//create token
	const token = user.getSignedJwtToken();

	res.status(200).json({ success: true, token });
});
