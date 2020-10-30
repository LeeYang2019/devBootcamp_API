//bring in ErrorResponse
const ErrorResponse = require('../middleware/error');
//bring in AsyncHandler
const asyncHandler = require('../middleware/async');
//bring in reviews model
const Review = require('../models/Review');

// @desc    GET all reviews
exports.getReviews = asyncHandler(async (req, res) => {});

// @desc    GET a review
exports.getReview = asyncHandler(async (req, res) => {});

// @desc    POST a review
exports.addReview = asyncHandler(async (req, res) => {});

// @desc    PUT a review
exports.updateReview = asyncHandler(async (req, res) => {});

// @desc    Delete a review
exports.deleteReview = asyncHandler(async (req, res) => {});
