const ErrorResponse = require('../middleware/error');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @desc    GET all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
exports.getReviews = asyncHandler(async (req, res, next) => {
	// if bootcampId exists/defined
	if (req.params.bootcampId) {
		//route with bootcamp id
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });
		res
			.status(200)
			.json({ success: true, count: reviews.length, data: reviews });
	} else {
		//route without bootcamp id
		res.status(200).json(res.advancedResults);
	}
});

// @desc    GET a single review
// @route	GET /api/v1/reviews/:id
// @access	public
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!review) {
		return next(
			new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
		);
	} else {
		res.status(200).json({ success: true, data: review });
	}
});

// @desc    POST add a review
// @route	POST /api/v1/bootcamps/:bootcampId/reviews
// @access	Private
exports.addReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No bootcamp with the id of ${req.params.bootcampId}`,
				404
			)
		);
	}

	const review = await Review.create(req.body);

	res.status(201).json({
		success: true,
		data: review,
	});
});

// @desc    PUT update a review
// @route	POST /api/v1/reviews/:id
// @access	Private
exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(`No review with the id of ${req.params.id}`, 400)
		);
	}

	// if review belongs to user (user or admin)
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`Not authorized to update review`, 401));
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ review });
});

// @desc    Delete a review
// @route	DELETE /api/v1/reviews/:id
// @access	Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(`No review with the id of ${req.params.id}`, 400)
		);
	}

	// if review belongs to user (user or admin)
	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse(`Not authorized to update review`, 401));
	}

	await Review.deleteOne();

	res.status(200).json({});
});
