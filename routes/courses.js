const express = require('express');
const {
	getCourses,
	getCourse,
	updateCourse,
	deleteCourse,
	postCourse,
} = require('../controllers/courses');

const router = express.Router();

//routes without passing id
router.route('/').get(getCourses).post(postCourse);

//routes requiring an id
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
