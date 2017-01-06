var keystone = require('keystone');

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
		categories: [],
		provinces: [],
    homeImage: [],
	};
	// Load the places
	view.on('init', function(next) {
		var q = keystone.list('Tour')
			.paginate({
				page: req.query.page || 1,
				perPage: 9,
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
			console.log(results);
			next(err);
		});

	});
  

   view.on('init', function(next) {

		keystone.list('Province').model.find().limit(5).exec(function(err, results) { //Query Pais
			if (err || !results) {

				return res.status(404);
			}
			locals.data.provinces = results;
			return next();

		});

	});
    view.render('static/about_us', { layout: 'test' });
}

