const express = require('express');
const {
	getCourses,
	getCourse,
	updateCourse,
	deleteCourse,
	postCourse,
} = require('../controllers/courses');

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

//include mergeParams so other routes could be passed to other routes
const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

//routes without passing id
router
	.route('/')
	.get(
		advancedResults(Course, {
			path: 'bootcamp',
			select: 'name, description',
		}),
		getCourses
	)
	.post(protect, authorize('publisher', 'admin'), postCourse);

//routes requiring an id
router
	.route('/:id')
	.get(getCourse)
	.put(protect, authorize('publisher', 'admin'), updateCourse)
	.delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
