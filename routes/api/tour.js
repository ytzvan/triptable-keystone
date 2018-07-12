var async = require('async'),
	keystone = require('keystone');

var Tour = keystone.list('Tour');

/**
 * List Tour
 */
exports.list = function(req, res) {
	let query = req.query;
	let search = {};
	
	if (query.q) {
		search.keywords = { $regex: '.*' + query.q + '.*' };
	}
	if (query.hotelPickup) {
		search.hotelPickup = {"hotelPickup": query.hotelPickup}
	}

	Tour.model.find(search, function(err, items) {

		if (err) return res.apiError('database error', err);
		console.log("total", items.length);
		res.apiResponse({
			tours: items,
			count: items.length
		});

	});
}

/**
 * Get Tour by ID
 */
exports.get = function(req, res) {
	Tour.model.findById(req.params.id).exec(function(err, item) {

		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');

		res.apiResponse({
			tour: item
		});

	});
}


/**
 * Create a Tour
 */
exports.create = function(req, res) {

	var item = new Tour.model(),
		data = (req.method == 'POST') ? req.body : req.query;

	item.getUpdateHandler(req).process(data, function(err) {

		if (err) return res.apiError('error', err);

		res.apiResponse({
			tour: item
		});

	});
}

/**
 * Get Tour by ID
 */
exports.update = function(req, res) {
	Tour.model.findById(req.params.id).exec(function(err, item) {

		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');

		var data = (req.method == 'POST') ? req.body : req.query;

		item.getUpdateHandler(req).process(data, function(err) {

			if (err) return res.apiError('create error', err);

			res.apiResponse({
				tour: item
			});

		});

	});
}

/**
 * Delete Post by ID
 */
exports.remove = function(req, res) {
	Tour.model.findById(req.params.id).exec(function (err, item) {

		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');

		item.remove(function (err) {
			if (err) return res.apiError('database error', err);

			return res.apiResponse({
				success: true
			});
		});
	});
}
