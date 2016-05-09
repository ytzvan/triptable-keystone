var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'blog';
	locals.filters = {
		category: req.params.category
	};
  locals.meta = {};
  	var url = req.url;
	locals.meta.url = "https://www.triptableapp.com"+url;
	locals.data = {
		posts: [],
		categories: []
	};

      locals.meta.title = "El blog de viajes de Triptable";
			locals.meta.keywords = "blog, viajes, travel, triptable blog, latinoamerica, cosas que hacer, tripts, tours, articulos";
			locals.meta.description = "El blog de viajes de Triptable es un espacio creado para descubrir tours y los mejores destinos turísticos en latinoamérica";
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogType = "website";
			locals.meta.ogDescription = locals.meta.description;

	// Load all categories
	view.on('init', function(next) {

		keystone.list('BlogCategory').model.find().sort('name').exec(function(err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.categories = results;

			// Load the counts for each category
			async.each(locals.data.categories, function(category, next) {

				keystone.list('Post').model.count().where('categories').in([category.id]).exec(function(err, count) {
					category.postCount = count;
					next(err);
				});

			}, function(err) {
				next(err);
			});

		});

	});

	// Load the current category filter
	view.on('init', function(next) {

		if (req.params.category) {
			keystone.list('BlogCategory').model.findOne({ key: locals.filters.category }).exec(function(err, result) {
				locals.data.category = result;
				next(err);
			});
		} else {
			next();
		}

	});

	// Load the posts
	view.on('init', function(next) {

		var q = keystone.list('Post').paginate({
				page: req.query.page || 1,
				perPage: 6,
				maxPages: 10
			})
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author categories');

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function(err, results) {
			locals.data.posts = results;
			next(err);
		});

	});

	// Render the view
	view.render('blog');

};
