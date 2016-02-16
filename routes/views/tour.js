var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'tours';
	locals.filters = {
		tour: req.params.tour
	};
	locals.data = {
		tours: []
	};
	
	// Load the current post
	view.on('init', function(next) {
		
		var q = keystone.list('Tour').model.findOne({
			state: 'published',
			slug: locals.filters.tour
		}).populate('owner categories');
		
		q.exec(function(err, result) {
			locals.data.tour = result;
			next(err);
		});
		
	});
	
	// Load other posts
	view.on('init', function(next) {
		
		var q = keystone.list('Tour').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');
		
		q.exec(function(err, results) {
			locals.data.tours = results;
			next(err);
		});
		
	});
	
	// Render the view
	view.render('tour');
	
};
