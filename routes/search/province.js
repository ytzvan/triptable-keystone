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

		keystone.list('Province').model.findOne(query).exec(function(err, province) { //Query states

			if (err || !province) {
				return res.status(404).render('errors/404');
			}
			locals.data.province = province;
			var id = province._id;
			var provinceName = province.province;
			locals.meta.title = "Triptable: Reserva Tours, Actividades y Qué hacer en " + provinceName + ".";
			locals.meta.keywords = "turismo en " +  provinceName + ", cosas que hacer en " +provinceName+ ", tours en " +provinceName+ ", actividades en " + provinceName + ", excursiones en " +provinceName;
			locals.meta.description =  "Reserva tours en " + provinceName  + ", actividades, viajes y turismo en " + provinceName + ". Con Triptable reservas experiencias locales unicas en " +provinceName;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description + " Tours y actividades baratas en " + provinceName;
			if (province.image) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,q_50,h_400,w_600/v"+province.image.version+"/"+province.image.public_id+"."+province.image.format;
			}
			var q = keystone.list('Tour')
  			.paginate({
  				page: req.query.page || 1,
  				perPage: 20,
			})
      .find({"state": "published"})
			 .where("province", id)
        .sort('-publishedDate')
			 .populate('city province categories');
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
	view.render('search/state');

};
