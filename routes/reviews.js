//bring in express
const express = require('express');
//bring in controller
const {
	getReviews,
	getReview,
	addReview,
	updateReview,
	deleteReview,
} = require('../controllers/reviews');

const Review = require('../models/Review');

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

//create router
const router = express.Router({ mergeParams: true });

//general route
router
	.route('/')
	.get(
		advancedResults(Review, {
			path: 'bootcamp',
			select: 'name description',
		}),
		getReviews
	)
	.post(protect, authorize('user', 'admin'), addReview);

//route with id
router
	.route('/:id')
	.get(getReview)
	.put(protect, authorize('user', 'admin'), updateReview)
	.delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
