var keystone = require('keystone');
var async = require('async');
var QueryUtils = require('../../utils').QueryUtils;

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
	var category = req.query.categoria;
	locals.data.province;
	locals.data.place;
	locals.meta = {};
	var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
	query = {
		'slug' : req.params.city,
	};
	locals.data.city = req.params.city;


	view.on('init', function(next) {

		keystone.list('City').model.findOne(query).populate('country').exec(function(err, place) { //Query states

			if (err || !place) {
				return res.status(404).render('errors/404');
			}
			locals.data.place = place;
			locals.data.placeName = place.city;
			var id = place._id;
			var provinceName = locals.data.placeName;
			locals.data.country = place.country.slug;
			var countryName = place.country.country;
	

			keystone.list('City') //Get other cities from country
			.model.aggregate([
			{'$match': {"country":place.country._id} },
		//	{ '$group' : { _id : "$featured", tours: { $push: "$$ROOT" },}}
			])
		 	.sort("-featured")
			.exec(function(err, results) { //Query Pais
				if (err || !results) {
					return res.status(404);
				}
				locals.data.cities = results;
			});

			locals.meta.title = "Cosas que Hacer en " + provinceName + ". Reserva tours y actividades en " + countryName;
			locals.meta.keywords = "turismo en " +  provinceName + ", cosas que hacer en " +provinceName+ ", tours a " +provinceName+ ", actividades en " + provinceName + ", excursiones en " +provinceName;
			locals.meta.description =  "Reserva tours y actividades en " + provinceName  + ". Con Triptable reservas tours baratos en " +provinceName;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description + ". Los mejores tours y actividades en " + provinceName;
			if (place.image) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/w_900/v"+place.image.version+"/"+place.image.public_id+"."+place.image.format;
			}

			var q = keystone.list('Tour')
  			.paginate({
  				page: req.query.page || 1,
  				perPage: 20,
			})
      .find({"state": "published"})
			 .where("city", id)
        .sort('-publishedDate')
			 .populate('province country categories city');
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
	view.render('search/country');

};
