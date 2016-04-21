var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Init locals
	locals.section = 'province';
	
	locals.data = {
		cities: [],
		tours: [],
		categories : [],
		provinces : [],
    filters: [],
    country : req.params.country
	};
	var category = req.query.categoria;
	console.log(category);
	locals.data.province;
	query = {
		'slug' : req.params.province,
	};
	
	view.on('init', function(next) {
			
		if (req.query.categoria) {
			keystone.list('PostCategory').model.findOne({ slug: category }).exec(function(err, result) {
				locals.data.filters = result;
				console.log(result);
				next(err);
			});
		} else {
			next();
		}
			
	});
	// Load all categories
	view.on('init', function(next) {
		
		keystone.list('Province').model.findOne(query).exec(function(err, province) { //Query states
			
			if (err || !province) {
				console.log("err", err);
				return res.status(404).render('errors/404');
			}
			locals.data.province = province;
			var id = province._id;
			var q = keystone.list('Tour')
  			.paginate({
  				page: req.query.page || 1,
  				perPage: 5,
			})
			 .where("province", id)
			 .populate('city province categories');
			 console.log(category);
  			if (category) {
  				q.where('categories').in([locals.data.filters]);
  			}
	
  			q.exec(function(err, results) {
  					locals.data.tours = results;
  					next(err);
  			});
		});
		
	});

	view.on('init', function(next) {
		
		keystone.list('Province').model.find().exec(function(err, results) { //Query Pais
			if (err || !results) {
				console.log("err", err);
				return res.status(404);
			}
			locals.data.provinces = results;
			return next();
			
		});
		
	});

	view.on('init', function(next) {
		
		keystone.list('PostCategory').model.find().exec(function(err, results) { //Query Pais
			if (err || !results) {
				console.log("err", err);
				return res.status(404);
			}
			locals.data.categories = results;
			return next();
			
		});
		
	});
	
	// Load the current category filter
	
	// Load the posts

	
	// Render the view
	view.render('search/state');
	
};
