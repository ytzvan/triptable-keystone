var keystone = require('keystone');
var async = require('async');
;
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
			.where('featured', true)
			.sort('-publishedDate')
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
			return next();

		});

	});

	view.on('init', function(next) {

		keystone.list('PostCategory').model.find().exec(function(err, results) { //Query Pais
			if (err || !results) {

				return res.status(404);
			}
			locals.data.categories = results;
			return next();

		});

	});

  view.on('init', function(next) {

		keystone.list('Attraction').model.find().where({'featured': true}).exec(function(err, results) { //Query attractions
			if (err || !results) {

				return res.status(404);
			}
			locals.data.attractions = results;
			return next();

		});

	});

  view.on('init', function(next){
    keystone.list('homeGallery').model.find()
    .exec(function(err, result){
      if (result){
        var id = Math.floor((Math.random() * result.length));
        console.log(id);
        locals.data.homeImage = result[id];
      }
      next();
    })
  });

	// Render the view
	view.render('index');
};
