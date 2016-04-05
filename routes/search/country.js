var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Init locals
	locals.section = 'country';
	locals.data = {
		provinces: [],
		tours: [],
	};
	locals.data.country;
	query = {
		'slug' : req.params.country,
	};
	console.log(query);
	
	// Load all categories
	view.on('init', function(next) {
		
		keystone.list('Country').model.findOne(query).exec(function(err, results) { //Query Pais
			if (err || !results) {
				console.log("err", err);
				return res.status(404).render('errors/404');
			}
			locals.data.country = results;
			console.log("country", locals.data.country)
			var id = results._id;
			console.log("id", id);
			keystone.list('Province').model.find({"country": id}).exec(function (err, provinces){ //Query states
				console.log("provinces", provinces);
				locals.data.provinces = provinces;
				keystone.list('Tour').model.find({"country": id}).exec(function (err, tours){ //Query Featured tours
					locals.data.tours = tours;
					return next();
				});
			})

			
		});
		
	});
	
	// Load the current category filter
	
	// Load the posts

	
	// Render the view
	view.render('search/country');
	
};
