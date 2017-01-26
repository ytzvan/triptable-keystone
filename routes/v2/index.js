var keystone = require('keystone');
var async = require('async');

exports.init = function(req, res) {
    var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'tours';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		tours: [],
		categories: [],
		provinces: [],
    homeImage: [],
	};
	// Load the places
	view.on('init', function(next) {
		var q = keystone.list('Tour')
			.paginate({
				page: req.query.page || 1,
				perPage: 3,
				maxPages: 10
			})
			.where('state', 'published')
	//		.where('featured', false)
			.sort('-updatedAt')
			.populate('owner categories country province city');

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function(err, results) {
			locals.data.tours = results;
			
			next(err);
		});

	});

	view.on('init', function(next) {

		keystone.list('Province').model.find().exec(function(err, results) { //Query Pais
			if (err || !results) {

				return res.status(404);
			}
			locals.data.provinces = results;

		});

		keystone.list('PostCategory').model.find().exec(function(err, categories) { //Query Pais
			if (err || !categories) {

				return res.status(404);
			}
			locals.data.categories = categories;
			console.log("categories", locals.data.categories);

		});

		return next();
	});

	/*view.on('init', function(next) {

		keystone.list('PostCategory').model.find().exec(function(err, results) { //Query Pais
			if (err || !results) {

				return res.status(404);
			}
			locals.data.categories = results;
			return next();

		});

	}); */
/* attraction */
  /*view.on('init', function(next) {

		keystone.list('Attraction').model.find().where({'featured': true}).exec(function(err, results) { //Query attractions
			if (err || !results) {

				return res.status(404);
			}
			locals.data.attractions = results;
			return next();

		});

	}); */
/*random home  img */
	 /* view.on('init', function(next){
	    keystone.list('homeGallery').model.find()
	    .exec(function(err, result){
	      if (result){
	        var id = Math.floor((Math.random() * result.length));
	        locals.data.homeImage = result[id];
	      }
	      next();
	    })
	  }); */
	// Render the view
    view.render('v2/index', {layout: 'v2'}); 

}

