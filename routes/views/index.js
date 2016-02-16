var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Init locals
	locals.section = 'tours';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		tours: [],
		categories: []
	};
	
	// Load the places
	view.on('init', function(next) {
		
		var q = keystone.list('Tour').paginate({
				page: req.query.page || 1,
				perPage: 3,
				maxPages: 10
			})
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('owner categories');
		
		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}
		
		q.exec(function(err, results) {
			locals.data.tours = results;
			console.log(locals.data.tours);
			next(err);
		});
		
	});

	// Render the view
	view.render('index');
};
