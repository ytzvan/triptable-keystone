var keystone = require('keystone');
var striptags = require('striptags');
var Review = keystone.list('Review');
var CityModel = keystone.list('City');

exports.init = function(req, res) {
  var view = new keystone.View(req, res);
	var locals = res.locals;
	var tourId;
	// Set locals
	locals.section = 'city';
	locals.filters = {
		tour: req.params.slug
		
	};
  var url = req.url;

	locals.data = {
		tours: [],
		reviews: [],
    url : url
	};

	locals.meta = {};

	locals.meta.url = "https://www.triptable.com/destination/"+slug;
	// Load the current post
	view.on('init', function(next) {

		var q = keystone.list('City').model.findOne({
			state: 'published',
			slug: locals.filters.tour
		}).populate('owner categories country province city');

		q.exec(function(err, result) {
      if (err || !result) {
				return res.status(404).render('errors/404');
			}
			locals.data.tour = result;
			tourId = result._id;

			/*Load Reviews */
			locals.meta.title = result.name +". Reserva Tours y Actividades en Triptable."
			locals.meta.keywords = result.keywords;
			var desc = result.description.short;
			var cleanStr = striptags(desc);
			
			locals.meta.description = cleanStr;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description + ". Con Triptable descubres y reservas Tours y actividades baratas en " + result.city.city + ", "+result.country.country +".";
			var img = result.images[0];
			if (img) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,h_400,w_600,q_75/v"+img.version+"/"+img.public_id+"."+img.format;
			}
		});

	});


	
	// Render
    view.render('v2/tour', {layout: "v2-white"}); 

}


