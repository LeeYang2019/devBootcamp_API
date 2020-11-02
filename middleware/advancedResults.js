const advancedResults = (model, populate) => async (req, res, next) => {
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
	query = model.find(JSON.parse(queryStr));

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
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//if populate parameter exists
	if (populate) {
		query = query.populate(populate);
	}

	//executing query
	const results = await query;

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

	res.advancedResults = {
		sucess: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
