const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');

// @Desc    GET all courses
// @Route   GET /api/v1/courses
// @Route   GET /api/v1/bootcamps/:bootcampId/courses
// @Access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;

	//check to see if a bootcampId has also been provided
	if (req.params.bootcampId) {
		//get all courses associated with the bootcampId
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		//get all courses
		// query = Course.find().populate('bootcamp');
		//populate allows me not to have to call simultaneous routes
		query = Course.find().populate({
			path: 'bootcamp',
			select: 'name, description',
		});
	}

	const courses = await query;
	res.status(200).json({ success: true, count: courses.length, data: courses });
});

// @Desc    GET a course
// @Route   GET /api/v1/courses/:id
// @Access  Private
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course)
		return next(new ErrorResponse(`Course not found with id ${req.params.id}`));

	res.status(200).json({ success: true, data: course });
});

// @Desc    POST a course
// @Route   POST /api/v1/courses
// @Access  Private
exports.postCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.create(req.body);
	res.status(200).json({ success: true, data: course });
});

// @Desc    PUT update a course
// @Route   PUT /api/v1/courses/:id
// @Access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {});

// @Desc    Delete a course
// @Route   Delete /api/v1/courses/:id
// @Access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {});
