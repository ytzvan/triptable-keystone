var keystone = require('keystone');
var async = require('async');
var QueryUtils = require('../../utils').QueryUtils;
var cityId;
const Url = require('url');
exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'city';
	locals.data = {
		cities: [],
		tours: [],
		categories : [],
		provinces : [],
    filters: [],
    country : req.params.country
	};
	locals.data.filter = req.query.filter;

	locals.data.province;
	locals.data.place;
	locals.meta = {};
	var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
	query = {
		'slug' : req.params.city,
	};
	locals.data.city = req.params.city;

	locals.data.url = url;

	view.on('init', function(next) {

		keystone.list('City').model.findOne(query)
		.populate('country collections')
		.exec(function(err, place) { //Query tours from city

			if (err || !place) {
				return res.status(404).render('errors/404');
			}
			locals.data.place = place;
			locals.data.placeName = place.city;
			
			var id = place._id;
			cityId = place._id;
			var cityName = locals.data.placeName;
			locals.data.country = place.country.slug;
			var countryName = place.country.country;
			locals.data.collections = place.collections;

			keystone.list('City') //Get other cities from country
			.model.aggregate([
			{'$match': {"country":place.country._id} },
		//	{ '$group' : { _id : "$featured", tours: { $push: "$$ROOT" },}}
			])
		 	.sort("city")
			.exec(function(err, results) { //Query Pais
				if (err || !results) {
					return res.status(404);
				}
				locals.data.cities = results;
			});

			locals.meta.title = "Top 2019 Tours, Actividades y Qué hacer en " + cityName + ", "+ countryName +" - Triptable ";
			locals.meta.keywords = "turismo en " + cityName + ", que hacer en " + cityName + ", tours en " + cityName + ", actividades en " + cityName + ", excursiones en " + cityName;
			locals.meta.description = "Reserva tours en " + cityName + ", actividades, viajes y turismo en " + cityName + ". Con Triptable reservas experiencias locales unicas en " + cityName;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description + ". Top 2019 Mejores tours y actividades en " + cityName;
			locals.meta.canonical = req.url;
			if (place.image) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/w_900/v"+place.image.version+"/"+place.image.public_id+"."+place.image.format;
			}

			var q = keystone.list('Tour')
  				.paginate({page: req.query.page || 1, perPage: 18})
		        .find({"state": "published"})
						.where("city", id)
		        .sort('-publishedDate')
						.populate('province country categories city')
					if (locals.data.filter) {
							q.where('collections', locals.data.filter)
							locals.data.activeCollection = locals.data.filter;

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
			});

	});

	// Load the current category filter

	// Load the posts


	// Render the view
	view.render('search/country');

};
