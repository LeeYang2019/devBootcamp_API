const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	const bootcamps = await Bootcamp.find();

	if (!bootcamps) return res.status(400).json({ success: false });

	res
		.status(200)
		.json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc    GET a bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	//get the bootcamp by its id
	const bootcamp = await Bootcamp.findById(req.params.id);

	//if bootcamp does not exist...
	if (!bootcamp)
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);

	//respond with the bootcamp
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamp
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamp/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!bootcamp)
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);

	res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamp/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	// get the bootcamp to delete
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	// if the bootcamp does not exist
	if (!bootcamp)
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);

	res.status(200).json({ success: true, data: {} });
});
