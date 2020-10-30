const express = require('express');
const {
	getCourses,
	getCourse,
	updateCourse,
	deleteCourse,
	postCourse,
} = require('../controllers/courses');

//include mergeParams so other routes could be passed to other routes
const router = express.Router({ mergeParams: true });

//routes without passing id
router.route('/').get(getCourses).post(postCourse);

//routes requiring an id
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
