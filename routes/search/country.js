var keystone = require('keystone');
var async = require('async');
var QueryUtils = require('../../utils').QueryUtils;

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
		categories : [],
		cities: []
	};
	locals.cities = [];
	locals.meta = {};
	var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
	query = {
		'slug' : req.params.country,
	};
	locals.data.city = "";
	
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

		keystone.list('Country').model.findOne(query).exec(function(err, place) { //Query Pais
			if (err || !place) {
				return res.status(404).render('errors/404');
			}
			var id = place._id;
			locals.data.placeId = place._id;
			

			keystone.list('City') //Get other cities from country
				.model.aggregate([
				{'$match': {"country":place._id, "featured": true} },
			//	{ '$group' : { _id : "$featured", tours: { $push: "$$ROOT" },}}
				])
			 	.sort("-featured")
				.exec(function(err, results) { //Query Pais
					if (err || !results) {
						return res.status(404);
					}
					locals.data.cities = results;
				});

			locals.data.place = place;
			locals.data.placeName = place.country;
			locals.data.country = place.country;
			var country = place.country;
			locals.meta.title = "Top 2019 Tours, Actividades y Qué hacer en " + country + " - Triptable ";
			locals.meta.keywords = "turismo en " +  country + ", cosas que hacer en " +country+ ", tours en " +country+ ", actividades en " + country + ", excursiones en " +country + ".";
			locals.meta.description = "Reserva tours en " + country + ", actividades, viajes y turismo en " + country + ". Con Triptable reservas experiencias locales unicas en " + country;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description;
			if (place.image) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,h_400,w_600,q_50/v"+place.image.version+"/"+place.image.public_id+"."+place.image.format;
			}
			locals.meta.canonical = req.url;
			var q = keystone.list('Tour')
				.paginate({
					page: req.query.page || 1,
					perPage: 18,
				})
        .find({"state": "published"})
				.where("country", id)
        .sort('-publishedDate')
				.populate('city province categories');
				if (category) {
					q.where('categories').in([locals.data.filters]);
				}

				q.exec(function(err, results) {
					var origin = req.get('origin');
					let base = req.path;
					if (results.next) {
						locals.meta.nextUrl = base+"?page="+results.next;
					}
					if (results.previous) {
						locals.meta.prevUrl = base+"?page="+results.previous;
					}
						results.currency = req.session.currency.currency;
						locals.data.tours = results;
						next(err);
				});
			})


		});

	// Load the tour categories
 view.on('init', function(next) {
			var id = locals.data.placeId;
			keystone.list('Tour').paginate({
					page: req.query.page || 1,
					perPage: 4,
				})
        .find({"state": "published"})
				.where("country", id)
				.where("featured", true)
        .sort('-publishedDate')
				.populate('city province categories')
				.exec(function (err, results){
				if (err || !results) {
					return res.status(404);
				}
					locals.data.top = results;
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


	// Render the view
	view.render('search/country');

};
