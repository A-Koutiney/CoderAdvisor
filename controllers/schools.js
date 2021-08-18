import School from '../models/School.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';
import path from 'path';
import geocoder from '../utils/geocoder.js';
// @desc Get all schools
// @rout GET  /api/schools
// @access public

export const getSchools = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedFilteringResults);
});
// @desc Get single school
// @rout GET  /api/schools/:id
// @access public
export const getSchool = asyncHandler(async (req, res, next) => {
	const school = await School.findById(req.params.id);
	if (!school) {
		return next(
			new ErrorResponse(`Can not find school with the id of ${req.params.id}`)
		);
	}
	res.status(201).json({
		success: true,
		data: school,
	});
});

// @desc Ceate a school
// @rout POST  /api/schools
// @access public

export const createSchool = asyncHandler(async (req, res, next) => {
	// add user to req.body
	req.body.user = req.user.id;

	// user already has a school?
	const ownerSchool = await School.findOne({ user: req.user.id });

	// only admin can add more than one school
	if (ownerSchool && !req.user.role === 'admin') {
		return next(
			new ErrorResponse(
				`User with the id of ${req.user.id} already has a school`,
				400
			)
		);
	}
	const school = await School.create(req.body);
	res.status(201).json({
		success: true,
		data: school,
	});
});

// @desc update school
// @rout PUT  /api/schools/:id
// @access private

export const updateSchool = asyncHandler(async (req, res, next) => {
	const id = req.params.id;

	let school = await School.findById(id);
	if (!school) {
		return next(
			new ErrorResponse(`Can not find school with the id ${req.params.id}`)
		);
	}
	// Ownership check
	if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
		new ErrorResponse(
			`User with the id of ${req.params.id} is not authorized.`,
			401
		);
	}

	school = await School.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({
		success: true,
		data: school,
	});
});

// @desc delete school
// @rout DELETE /api/schools/:id
// @access private

export const deleteSchool = asyncHandler(async (req, res, next) => {
	const id = req.params.id;

	const school = await School.findById(id);
	if (!school) {
		return next(
			new ErrorResponse(`Can not find school with the id ${req.params.id}`)
		);
	}
	/// ownership check
	if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
		new ErrorResponse(
			`User with the id of ${req.params.id} is not authorized.`,
			401
		);
	}

	await school.remove();
	res.status(200).json({
		success: true,
		data: [],
	});
});

// @desc get schools within a certain distance in KM
// @rout GET /api/schools/distance/:zipcode/:distance
// @access private

export const getSchoolWithInDistance = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;
	// Earth radius is 6378 km
	// radius = distance/radius
	const earthRadius = 6378;
	const radius = distance / earthRadius;

	const schools = await School.find({
		location: {
			$geoWithin: { $centerSphere: [[lng, lat], radius] },
		},
	});

	res.status(200).json({
		success: true,
		count: schools.length,
		data: schools,
	});
});

// @desc upload photo
// @rout PUT /api/schools/:id/photo
// @access private

export const uploadSchoolPhoto = asyncHandler(async (req, res, next) => {
	const id = req.params.id;

	const school = await School.findById(id);
	if (!school) {
		return next(
			new ErrorResponse(`Can not find school with the id ${req.params.id}`)
		);
	}
	/// ownership check
	if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
		new ErrorResponse(
			`User with the id of ${req.params.id} is not authorized.`,
			401
		);
	}

	if (!req.files) {
		return next(new ErrorResponse('Please upload a photo', 400));
	}
	const file = req.files.file;
	console.log(req.files.file);
	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse('Please upload a photo', 400));
	}
	// Size
	if (file.size > process.env.MAX_PHORO_SIZE) {
		return next(
			new ErrorResponse(
				`Photo size should be less than ${process.env.MAX_PHORO_SIZE}`,
				400
			)
		);
	}

	/// name photo
	file.name = `photo${school._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.PHOTO_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(
				new ErrorResponse(`Error uploading photo, please try again`, 500)
			);
		}
		await School.findByIdAndUpdate(id, { photo: file.name });
		res.status(200).json({
			success: true,
			data: file.name,
		});
	});
});
