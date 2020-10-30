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

//create router
const router = express.Router();

//general route
router.route('/').get(getReviews).post(addReview);

//route with id
router.route('/:id').get(getReview).put(updateReview).delete(deleteReview);

module.exports = router;
