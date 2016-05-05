var keystone = require('keystone');
var striptags = require('striptags');
var Review = keystone.list('Review');


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
		}).populate('owner categories country province city review');
		
		q.exec(function(err, result) {
			locals.data.tour = result;
			next(err);
			locals.meta.title = result.name +" Desde USD "+result.price+"$ por persona. Reserva Tours, Actividades y Excursiones en Triptable."
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

	view.on('post', { action: 'review' }, function(next) {
		
		var newReview = new Review.model(),
			updater = newReview.getUpdateHandler(req);
		console.log(req.body);
		updater.process(req.body, {
			flashErrors: true,
			fields: 'author, message, score, tour',
			errorMessage: 'There was a problem submitting your review:'
		}, function(err, data) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.reviewSubmitted = true;
			}
			next();
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
	view.on('init', function(next) {
		
		var q = keystone.list('Review').model.find();
		
		q.exec(function(err, results) {
			locals.data.reviews = results;
			next(err);
		});
		
	});
	// Render the view
	view.render('tour');
	
};
