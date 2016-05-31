var async = require('async'),
	keystone = require('keystone');

var Tour = keystone.list('Tour');

/**
 * List Tour
 */
exports.list = function(req, res) {
	Tour.model.find(function(err, items) {

		if (err) return res.apiError('database error', err);

		res.apiResponse({
			posts: items
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
			post: item
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
			post: item
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
				post: item
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
