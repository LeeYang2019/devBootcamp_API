const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { reset } = require('nodemon');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name'],
	},
	email: {
		type: String,
		required: [true, 'Please add an email'],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			'Please add a valid email',
		],
	},
	role: {
		type: String,
		enum: ['user', 'publisher'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
		minlength: 6,
		select: false,
	},
	resetPasswordToken: String,
	resetPasswordExpiration: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// sign jwt and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
	//compared enteredpassword with password in db
	return await bcrypt.compare(enteredPassword, this.password);
};

//generate and has password token
UserSchema.methods.getResetPasswordToken = function () {
	//generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	console.log(resetToken);

	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	//set expire
	this.resetPasswordExpiration = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
