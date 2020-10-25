// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Show all bootcamps' });
};

// @desc    GET a bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Get bootcamp id ${req.params.id}` });
};

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamp
// @access  Private
exports.createBootcamp = (req, res, next) => {
	res.status(200).json({ success: true, msg: 'Create a new bootcamp' });
};

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamp/:id
// @access  Private
exports.updateBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Update bootcamp id ${req.params.id}` });
};

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamp/:id
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Delete bootcamp id ${req.params.id}` });
};
