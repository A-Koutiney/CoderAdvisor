const advancedFilteringResults = (modelName, populate) => async (
	req,
	res,
	next
) => {
	let query;
	// Copy req.query
	let reqQuery = { ...req.query };

	// Fields to be removed from req.query
	const fieldsToBeRemoved = ['select', 'sort', 'page', 'limit'];

	fieldsToBeRemoved.forEach((field) => delete reqQuery[field]);
	// Check for mongoose operators
	let queryStr = JSON.stringify(reqQuery);
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (word) => `$${word}`);

	query = modelName.find(JSON.parse(queryStr));
	// check if there is any removed fields and attach them to the query

	// Select
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
	}
	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	// Pagination

	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 1;
	const startIndex = (page - 1) * limit; //2
	const endIndex = page * limit; //3
	const total = await modelName.countDocuments();
	query = query.skip(startIndex).limit(limit);
	if (populate) {
		query = query.populate(populate);
	}
	const results = await query;

	// Pagination result
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
	res.advancedFilteringResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};
	next();
};

export default advancedFilteringResults;
