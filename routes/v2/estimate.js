var keystone = require('keystone');
var striptags = require('striptags');
var Review = keystone.list('Review');
var CityModel = keystone.list('City');

exports.init = function(req, res) {

  var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.filters = {
		tour: req.params.slug
	};
	locals.data = {
		tour:{}
	};
	console.log('slug', req.params.slug);
	// Load the current post
	view.on('init', function(next) {
		var q = keystone.list('Tour').model.findOne({
			state: 'published',
			slug: locals.filters.tour
		}).populate('owner categories country province city');

		q.exec(function(err, result) {
      		if (err || !result) {
				return res.status(404).render('errors/404');
			}
			locals.data.tour = result;
			tourId = result._id;
		});
		next();
	});


	
	// Render
    view.render('v2/estimate', {layout: "v2-white"}); 

}


