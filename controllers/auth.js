//import ErrorResponse
const ErrorResponse = require('../utils/errorResponse');

//Import asyncHandler
const asyncHandler = require('../middleware/async');

const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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
	sendTokenResponse(user, 200, res);
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
	sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse(`There is no user with that email`, 404));
	}

	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// create reset url
	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has 
	requested the reset of a password. Please make a PUT reques to: \n\n ${resetURL}`;

	console.log(user);

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password reset token',
			message,
		});
		res.status(200).json({ success: true, data: 'Email sent' });
	} catch (error) {
		console.log(error.message);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiration = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse(`Email could not be sent`, 500));
	}

	res.status(200).json({ success: true, data: user });
});

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({ success: true, data: user });
});

// @desc    Log current logged in user out/clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({ success: true, data: {} });
});

// @desc    update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
	//update just name and email by creating boject just for name and email
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: user });
});

// @desc    Update password
// @route   POST /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
	//get current user
	const user = await User.findById(req.user.id).select('+password');

	//check current password
	if (!(await user.matchPassword(req.body.currentPassword)))
		return next(new ErrorResponse(`Password is incorrect`, 401));

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
	//get hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpiration: { $gt: Date.now() },
	});

	if (!user) return next(new ErrorResponse(`Invalide token`, 400));

	// set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpiration = undefined;

	await user.save();

	sendTokenResponse(user, 200, res);
});

// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	//create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'Production') {
		options.secure = true;
	}

	res
		.status(statusCode)
		.cookie('token', token, options)
		.json({ success: true, token });
};
