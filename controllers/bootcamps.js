const Bootcamp = require('../models/Bootcamp');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
	try {
		const bootcamps = await Bootcamp.find();

		if (!bootcamps) return res.status(400).json({ success: false });

		res
			.status(200)
			.json({ success: true, count: bootcamps.length, data: bootcamps });
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

// @desc    GET a bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = async (req, res, next) => {
	try {
		//get the bootcamp by its id
		const bootcamp = await Bootcamp.findById(req.params.id);

		//if bootcamp does not exist...
		if (!bootcamp) return res.status(400).json({ success: false });

		//respond with the bootcamp
		res.status(200).json({ success: true, data: bootcamp });
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamp
// @access  Private
exports.createBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.create(req.body);
		res.status(201).json({
			success: true,
			data: bootcamp,
		});
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamp/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!bootcamp) return res.status(400).json({ success: false });

		res.status(200).json({ success: true, data: bootcamp });
	} catch (error) {
		res.status(400).json({ success: false });
	}
};

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamp/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
	try {
		// get the bootcamp to delete
		const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
		// if the bootcamp does not exist
		if (!bootcamp) return res.status(400).json({ success: false });

		res.status(200).json({ success: true, data: {} });
	} catch (error) {
		res.status(400).json({ success: false });
	}
};
