import express from 'express';
import {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} from '../controllers/courses.js';

import Course from '../models/Course.js';
import advancedFilteringResults from '../middleware/advancedFilteringResults.js';
import { auth, limitAccess } from '../middleware/auth.js';
const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(
		advancedFilteringResults(Course, {
			path: 'school',
			select: 'name description',
		}),
		getCourses
	)
	.post(auth, createCourse);
router
	.route('/:id')
	.get(getCourse)
	.put(auth, limitAccess('admin', 'owner'), updateCourse)
	.delete(auth, limitAccess('admin', 'owner'), deleteCourse);

export default router;
