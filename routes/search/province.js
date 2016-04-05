var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Init locals
	locals.section = 'province';
	
	locals.data = {
		cities: [],
		tours: []
	};
	locals.data.province;
	query = {
		'slug' : req.params.province,
	};
	console.log(query);
	
	// Load all categories
	view.on('init', function(next) {
		
		keystone.list('Province').model.findOne(query).exec(function(err, province) { //Query states
			
			if (err || !province) {
				console.log("err", err);
				return res.status(404).render('errors/404');
			}
			locals.data.province = province;
			var id = province._id;
			keystone.list('City').model.find({"province": id}).exec(function (err, cities){ //Query states
				locals.data.cities = cities;
				keystone.list('Tour').model.find({"province": id}).exec(function (err, tours){ //Query Featured tours
					locals.data.tours = tours;
					return next();
				});
			})

			
		});
		
	});
	
	// Load the current category filter
	
	// Load the posts

	
	// Render the view
	view.render('search/state');
	
};
