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
	locals.data.province;
	locals.data.place;
	locals.meta = {};
	var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
	query = {
		'slug' : req.params.province,
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

		keystone.list('Province').model.findOne(query).populate('country').exec(function(err, place) { //Query states

			if (err || !place) {
				return res.status(404).render('errors/404');
			}
			locals.data.place = place;
			locals.data.placeName = place.province;
	
			var id = place._id;
			var provinceName = place.province;
			let countryName = place.country.country;
			let placeTitle = provinceName + ", " + countryName;
			locals.data.provinceName = provinceName;
			if (process.env.LANG == "es") {
				if (place.seoES.title) {
					locals.meta.title = place.seoES.title;
					locals.meta.description = place.seoES.description;
				} else {
					locals.meta.title = placeTitle + ". Tours, Actividades y Qué Hacer | Triptable.com";
					locals.meta.description = "Qué Hacer en " + placeTitle + ". Reserva excursiones, estadias y experiencias en " + provinceName +".";
				}
				locals.meta.keywords = "tours " + placeTitle + ", things to do " + placeTitle + ", activities in " + placeTitle + ", tourism in " + placeTitle + ", travel " + placeTitle + ", trips " + placeTitle; // Remover defaults en Layout
			}
			if (process.env.LANG == "en") {
				locals.meta.title = place.seoEN.title;
				locals.meta.description = place.seoEN.description;
			} else {
				locals.meta.title = placeTitle + ". Tours, Activities & Things to do | Triptable.com";
				locals.meta.description = "Things to do in " + placeTitle + ". Book tours, stays y experiences in " + provinceName + ".";
			}
			locals.meta.keywords = "tours " + placeTitle + ", things to do " + placeTitle + ", activities in " + placeTitle + ", tourism in " + placeTitle + ", travel " + placeTitle + ", trips " + placeTitle; // TODO: Traducir

			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description;
			locals.meta.canonical = req.url;
			if (place.image) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,q_50,h_400,w_600/v"+place.image.version+"/"+place.image.public_id+"."+place.image.format;
			}
			var q = keystone.list('Tour')
  			.paginate({
  				page: req.query.page || 1,
  				perPage: 18,
			})
      .find({"state": "published"})
			 .where("province", id)
        .sort('-publishedDate')
			 .populate('city province categories');
  			if (category) {
  				q.where('categories').in([locals.data.filters]);
  			}

  			q.exec(function(err, results) {
						results.currency = req.session.currency.currency;	
  					locals.data.tours = results;
  					next(err);
  			});
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

	// Load the current category filter

	// Load the posts


	// Render the view
	view.render('search/province');

};
