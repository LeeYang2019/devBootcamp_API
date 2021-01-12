const jwt = require('jsonwebtoken');
const asynHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asynHandler(async (req, res, next) => {
	let token;

	//if authorization is defined/exist and has bearer token
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		//get the second element in the authorization array
		token = req.headers.authorization.split(' ')[1];
	}

	//set token from cookie
	// else if (req.cookies.token) {
	// 	token = req.cookies.token;
	// }

	//if undefined or does not exist
	if (!token)
		return next(new ErrorResponse(`No authorized to access this route`, 401));

	try {
		//decode token and get id
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		//get user by decoded id
		req.user = await User.findById(decoded.id);
		//pass user
		next();
	} catch (error) {
		return next(new ErrorResponse(`Not authorized to access this route`, 401));
	}
});

exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role))
			return next(
				new ErrorResponse(
					`User role ${req.user.role} is not authorized to access this route`,
					403
				)
			);
		next();
	};
};
