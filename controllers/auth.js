import User from '../models/User.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import { unwatchFile } from 'fs';

// @desc Register User
// @rout post  /api/auth/register
// @access public

export const registerUser = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	const user = await User.create({
		name,
		password,
		email,
		role,
	});

	sendTokenAndResponse(user, 201, res);
});

// @desc Login User
// @rout post  /api/auth/login
// @access public

export const loginUser = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Make sure email and password are provided

	if (!email || !password) {
		return next(new ErrorResponse('Email & Password are required', 400));
	}
	// Get User
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		return next(new ErrorResponse('Invalid Credentials', 401));
	}

	// Match password
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		return next(new ErrorResponse('Invalid Credentials', 401));
	}
	sendTokenAndResponse(user, 200, res);
});

// @desc Get current singed in user
// @rout GET  /api/auth/me
// @access private

export const getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc forgot password
// @rout GET  /api/auth/forgotpassword
// @access public

export const forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new ErrorResponse('No user with this email', 404));
	}
	const restToken = user.getResetToken();

	await user.save({ validateBeforeSave: false });

	// Create rest url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/auth/resetpassword/${restToken}`;
	const message = `To reset your password please make a put request to: \n\n ${resetUrl}`;
	try {
		await sendEmail({
			email: user.email,
			subject: 'Password reset token',
			message,
		});
		res.status(200).json({
			success: true,
			data: 'Email sent',
		});
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new ErrorResponse('Email could not be sent', 500));
	}
});

// @desc Reset password
// @rout PUT  /api/auth/resetpassword/:resettoken
// @access public

export const resetPassword = asyncHandler(async (req, res, next) => {
	// hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');
	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});
	if (!user) {
		return next(new ErrorResponse('Invalid token', 400));
	}

	// set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();
	sendTokenAndResponse(user, 200, res);
});

// @desc Update user
// @rout put  /api/auth/updateUser
// @access private

export const updateUser = asyncHandler(async (req, res, next) => {
	const allowdFields = {
		name: req.body.name,
		email: req.body.email,
	};
	const user = await User.findByIdAndUpdate(req.user.id, allowdFields, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc Update password
// @rout GET  /api/auth/updatepassword
// @access private

export const updatePassowrd = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');
	// Check pass
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}
	user.password = req.body.newPassword;
	await user.save();
	sendTokenAndResponse(user, 200, res);
});

const sendTokenAndResponse = (user, statusCode, res) => {
	// sign token
	const token = user.signJwtToken();
	const options = {
		expires: new Date(
			Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}
	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};
