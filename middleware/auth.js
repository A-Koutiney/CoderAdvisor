import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

import User from '../models/User.js';

export const auth = asyncHandler(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	// else if(req.cookies.token){
	//   token = req.cookies.token
	// }

	if (!token) {
		return next(new ErrorResponse('Not authorized to access this route', 401));
	}

	// verfy token
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.user = await User.findById(decoded.id);
		next();
	} catch (err) {
		return next(new ErrorResponse('Not authorized to access this route', 401));
	}
});

// limit access to certain roles
export const limitAccess = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User with the role of ${req.user.role} is not authorized to access this route`,
					403
				)
			);
		}
		next();
	};
};
