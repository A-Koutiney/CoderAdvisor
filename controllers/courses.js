import Course from '../models/Course.js';
import School from '../models/School.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../middleware/asyncHandler.js';

//@desc Get all Courses
//@route GET api/courses/
//@route GET api/schools/:schoolId/courses
//@access public

export const getCourses = asyncHandler(async (req, res, next) => {
	if (req.params.schoolId) {
		const courses = await Course.find({ school: req.params.schoolId });
		res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} else {
		res.status(200).json(res.advancedFilteringResults);
	}
});

//@desc Get single Course
//@route GET api/courses/:id
//@access public

export const getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(
				`Can not find course with the id of ${req.params.id}  `,
				404
			)
		);
	}
	res.status(200).json({
		sucess: true,

		data: course,
	});
});

//@desc Create a Course
//@route POST api/schools/:schoolId/courses
//@access private

export const createCourse = asyncHandler(async (req, res, next) => {
	req.body.school = req.params.schoolId;
	req.body.user = req.user.id;
	console.log(req.body.user);
	console.log(req.user.id);
	const school = await School.findById(req.params.schoolId);
	if (!school) {
		return next(
			new ErrorResponse(
				`Can not find school with the id of ${req.params.schoolId}`,
				404
			)
		);
	}
	// Ownership check
	if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User with id of ${req.user.id} is not authorized to add a course to school: ${school._id}`,
				401
			)
		);
	}
	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course,
	});
});

//@desc update a Course
//@route PUT api/courses/:id
//@access private

export const updateCourse = asyncHandler(async (req, res, next) => {
	const id = req.params.id;

	let course = await Course.findById(id);
	if (!course) {
		return next(new ErrorResponse(`Can not find course with the id ${id}`));
	}
	if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User with id of ${req.user.id} is not authorized to update  course : ${course._id}`,
				401
			)
		);
	}

	course = await Course.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({
		success: true,
		data: course,
	});
});

//@desc delete a Course
//@route DELETE api/courses/:id
//@access private

export const deleteCourse = asyncHandler(async (req, res, next) => {
	const id = req.params.id;

	const course = await Course.findById(id);
	if (!course) {
		return next(new ErrorResponse(`Can not find course with the id ${id}`));
	}
	// Ownership check
	if (school.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User with id of ${req.user.id} is not authorized to delete course: ${course._id}`,
				401
			)
		);
	}
	await course.remove();
	res.status(200).json({
		success: true,
		data: [],
	});
});
