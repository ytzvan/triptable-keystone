var keystone = require('keystone');
var striptags = require('striptags');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'tours';
	locals.filters = {
		tour: req.params.slug
	};
	locals.data = {
		tours: []
	};
	locals.meta = {};
	var url = req.url;
	locals.meta.url = "https://www.triptableapp.com"+url;
	// Load the current post
	view.on('init', function(next) {
		
		var q = keystone.list('Tour').model.findOne({
			state: 'published',
			slug: locals.filters.tour
		}).populate('owner categories country province city');
		
		q.exec(function(err, result) {
			locals.data.tour = result;
			next(err);
			locals.meta.title = result.name + " en "+result.city.city+", "+result.country.country;
			locals.meta.keywords = result.keywords;
			var desc = result.description.short;
			var cleanStr = striptags(desc);
			locals.meta.description = cleanStr;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogDescription = locals.meta.description + " Tours y actividades baratas en " + result.city.city;
			if (result.images[0]) {
				locals.meta.image = result.images[0].secure_url;
			}
		});

	});

	
	// Load other posts
	view.on('init', function(next) {
		
		var q = keystone.list('Tour').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');
		
		q.exec(function(err, results) {
			locals.data.tours = results;
			next(err);
		});
		
	});
	// Render the view
	view.render('tour');
	
};
