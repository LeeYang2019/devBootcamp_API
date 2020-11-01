const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;

	//copy req.query
	const reqQuery = { ...req.query };

	// fields to exclude so it is not looked as a field in the query
	const removeFields = ['select', 'sort', 'page', 'limit'];

	// loop over and delete removeFields from reqQuery
	// so that they are not considered fields
	removeFields.forEach((field) => delete reqQuery[field]);

	//create query string
	let queryStr = JSON.stringify(reqQuery);

	//create operators
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	//finding resource query
	query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

	// select fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields); //query with select statement
	}

	//sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy); //query with sort statement
	} else {
		// return sort in descending order
		query = query.sort('-createdAt');
	}

	//pagination
	const page = parseInt(req.query.page, 10) || 1; //returns string in base 10  (0 - 9)
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//executing query
	const bootcamps = await query;

	//pagination result
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps,
	});
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
