const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
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
	const bootcamp = await Bootcamp.findById(req.params.id);
	// if the bootcamp does not exist
	if (!bootcamp)
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);

	bootcamp.remove();

	res.status(200).json({ success: true, data: {} });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamp/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	//get latitude and longitude from geocoder for given zipcode
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	//divide distance by radius of the earth
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res
		.status(200)
		.json({ success: true, count: bootcamps.length, data: bootcamps });
});

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	//get bootcamp
	const bootcamp = await Bootcamp.findById(req.params.id);

	//check to see if exist
	if (!bootcamp)
		return next(
			new ErrorResponse(`Bootcamp not found for id ${req.params.id}`),
			404
		);

	//check to see if there is a file in req
	if (!req.files) return next(new ErrorResponse(`Please upload a file`, 400));

	const file = req.files.file;

	//make sure the image is a photo
	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload na image less than ${process.env.MAX_FILE_UPLOAD}`,
				400
			)
		);
	}

	//create and append fileName + extension
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem with file upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
		res.status(200).json({ success: true, data: file.name });
	});
});
