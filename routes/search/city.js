var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Init locals
	locals.section = 'city';
	locals.data = {
		cities: [],
		tours: []
	};

	query = {
		'slug' : req.params.city,
	};
	console.log(query);
	
	// Load all categories
	view.on('init', function(next) {
		
		keystone.list('City').model.find(query).populate('Province').exec(function(err, cities) { //Query states
			
			if (err || !cities.length) {
				console.log("err", err);
				return res.status(404).render('errors/404');
			}
			locals.data.cities = cities;
			var id = cities[0]._id;
				keystone.list('Tour').model.find({"city": id }).exec(function (err, tours){ //Query Featured tours
					locals.data.tours = tours;
					return next();
				});
			})
		
	});
	
	// Load the current category filter
	
	// Load the posts

	
	// Render the view
	view.render('search/city');
	
};
