const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const { findById } = require('../models/Bootcamp');

// @Desc    GET all courses
// @Route   GET /api/v1/courses
// @Route   GET /api/v1/bootcamps/:bootcampId/courses
// @Access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	//check to see if a bootcampId has also been provided
	if (req.params.bootcampId) {
		//get all courses associated with the bootcampId
		const courses = await Course.find({ bootcamp: req.params.bootcampId });
		return res
			.status(200)
			.json({ success: true, count: courses.length, data: courses });
	} else {
		//get all courses
		// query = Course.find().populate('bootcamp');
		//populate allows me not to have to call simultaneous routes
		res.status(200).json(res.advancedResults);
	}
});

// @Desc    GET a course
// @Route   GET /api/v1/courses/:id
// @Access  Private
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name, description',
	});

	if (!course)
		return next(
			new ErrorResponse(`Course not found with id ${req.params.id}`),
			404
		);

	res.status(200).json({ success: true, data: course });
});

// @Desc    POST a course
// @Route   POST /api/v1/bootcamps/:bootcampId/courses
// @Access  Private
exports.postCourse = asyncHandler(async (req, res, next) => {
	//get bootcamp
	req.body.bootcamp = req.params.bootcampId;

	const bootcamp = Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id ${req.params.bootcampId}`,
				404
			)
		);
	}

	//need to pass req.boy with bootcamp id
	const course = await Course.create(req.body);
	res.status(200).json({ success: true, data: course });
});

// @Desc    PUT update a course
// @Route   PUT /api/v1/courses/:id
// @Access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course)
		return next(
			new ErrorResponse(`Course not found for id ${req.params.id}`, 404)
		);

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: course });
});

// @Desc    Delete a course
// @Route   Delete /api/v1/courses/:id
// @Access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course)
		return next(
			new ErrorResponse(`Course not found for id${req.params.id}`, 404)
		);

	await course.remove();

	res.status(200).json({ success: true, data: {} });
});
