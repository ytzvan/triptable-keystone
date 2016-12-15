var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'country';

	var category = req.query.categoria;
	locals.data = {
		provinces: [],
		tours: [],
		filters: [],
		categories : []
	};
	locals.data.country;
	locals.meta = {};
	var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
	query = {
		'slug' : req.params.country,
	};


	view.on('init', function(next) {

			if (req.query.categoria) {
				keystone.list('PostCategory').model.findOne({ slug: category }).exec(function(err, result) {
					locals.data.filters = result;
					next(err);
				});
			} else {
				next();
			}

		});

	view.on('init', function(next) {

		keystone.list('Country').model.findOne(query).exec(function(err, results) { //Query Pais
			if (err || !results) {
				return res.status(404).render('errors/404');
			}
			locals.data.country = results;
			var id = results._id;
			var country = results.country;
			locals.meta.title = "Triptable: Reserva Tours, Actividades y Qué hacer en " + results.country;
			locals.meta.keywords = "turismo en " +  country + ", cosas que hacer en " +country+ ", tours en " +country+ ", actividades en " + country + ", excursiones en " +country + ".";
			locals.meta.description =  "Reserva tours en " + country  + ", actividades, viajes y turismo en " + country + ". Con Triptable reservas experiencias locales unicas en " +country;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description + " Tours y actividades baratas en " + country;
			if (results.image) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,h_400,w_600,q_50/v"+results.image.version+"/"+results.image.public_id+"."+results.image.format;
			}
			var q = keystone.list('Tour')
				.paginate({
					page: req.query.page || 1,
					perPage: 10,
				})
        .find({"state": "published"})
				.where("country", id)
        .sort('-publishedDate')
				.populate('city province categories');
				if (category) {
					q.where('categories').in([locals.data.filters]);
				}

				q.exec(function(err, results) {
						locals.data.tours = results;
						next(err);
				});
			})


		});

	// Load the tour categories

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

		keystone.list('Province').model.find().exec(function(err, results) { //Query Pais
			if (err || !results) {
				return res.status(404);
			}
			locals.data.provinces = results;
			return next();

		});

	});

	// Render the view
	view.render('search/country');

};
