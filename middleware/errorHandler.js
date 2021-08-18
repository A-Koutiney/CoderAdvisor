import ErrorResponse from '../utils/ErrorResponse.js';
const errorHandler = (err, req, res, next) => {
	console.log(err.name);
	let error = { ...err };
	error.message = err.message;
	// mongoose error not correctly formatted id
	if (err.name === 'TypeError') {
		console.log(err);
	}
	if (err.name === 'CastError') {
		const message = `Can not find school with the id  ${err.value}`;
		error = new ErrorResponse(message, 404);
	}
	// mongoose validation errors
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors)
			.map((val) => val.message)
			.join(', ');
		error = new ErrorResponse(message, 400);
	}
	// mongoose duplicates errors
	if (err.code === 11000) {
		const message = 'This value already exists';
		error = new ErrorResponse(message, 400);
	}
	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
	});
};

export default errorHandler;
