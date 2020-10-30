const express = require('express');
const {
	getBootcamp,
	getBootcamps,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
} = require('../controllers/bootcamps');

//include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

//reroute into other resource routers
//for this route, pass it to the courseRouter to handle
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/').get(getBootcamps).post(createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;
