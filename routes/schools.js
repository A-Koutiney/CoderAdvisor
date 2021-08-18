import express from 'express';
import {
	getSchools,
	getSchool,
	updateSchool,
	deleteSchool,
	createSchool,
	getSchoolWithInDistance,
	uploadSchoolPhoto,
} from '../controllers/schools.js';
import coursesRouter from './courses.js';
import School from '../models/School.js';
import advancedFilteringResults from '../middleware/advancedFilteringResults.js';
import { auth, limitAccess } from '../middleware/auth.js';

const router = express.Router();
// Redirect routes to resource route
router.use('/:schoolId/courses', coursesRouter);

router
	.route('/')
	.get(advancedFilteringResults(School, 'courses'), getSchools)
	.post(auth, limitAccess('admin', 'owner'), createSchool);
router
	.route('/:id')
	.get(getSchool)
	.put(auth, limitAccess('admin', 'owner'), updateSchool)
	.delete(auth, limitAccess('admin', 'owner'), deleteSchool);
router
	.route('/:id/photo')
	.put(auth, limitAccess('admin', 'owner'), uploadSchoolPhoto);

router.route('/radius/:zipcode/:distance').get(getSchoolWithInDistance);

export default router;
