var keystone = require('keystone');
var striptags = require('striptags');
var Review = keystone.list('Review');
var TourModel = keystone.list('Tour');
var Moment = require('moment');
const getVideoId = require('get-video-id');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var tourId;
	// Set locals
	locals.section = 'tours';
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

	locals.meta.url = "https://www.triptable.com"+url;
	// Load the current post
	view.on('init', function(next) {

		var q = keystone.list('Tour').model.findOne({
			state: 'published',
			slug: locals.filters.tour
		}).populate('owner categories childs country province city');

		q.exec(function(err, result) {
      if (err || !result) {
				return res.status(404).render('errors/404');
			}
			result.currency = req.session.currency.currency;
			locals.data.tour = result;
			tourId = result._id;
			cart = [];
			locals.data.dates = result.datesAvailable;

			if (result.multiPrice){
				for (let i=0;i<result.multiPriceCatalog.length;1){
					var element = {};
					let obj = result.multiPriceCatalog[i];
					obj = obj.split(',');
					let from = obj[0];
					from = parseInt(from);
					let to = obj[1];
					to = parseInt(to);
					let price = obj[2];
					price = parseInt(price);
					element.from = from;
					element.to = to;
					element.price = price;
					cart.push(element);
					i=i+1;
				}
				locals.data.tour.multiPriceObj = cart;
			}

			/*Load Reviews */
			loadReviews(next);
			locals.meta.keywords = result.keywords;
			var desc = result.description.short;
			var cleanStr = striptags(desc);
			if (process.env.LANG === 'en'){
				if (result.name_eng) {
					locals.meta.title = result.name_eng + " - Triptable tours and activities";
				} else {
					locals.meta.title = result.name +" - Triptable tours y actividades";
				}
				if (result.description_eng.short) {
					locals.meta.description = result.description_eng.short;
				} else {
					locals.meta.description = cleanStr;
				}
			} else {
				locals.meta.title = result.name +" - Triptable tours y actividades";
				locals.meta.description = cleanStr;
			}
			locals.meta.ogTitle = locals.meta.title
			locals.meta.ogDescription = locals.meta.description + ". Tours en " + result.city.city + ", "+result.country.country +".";

			if (result.heroImage) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,h_900,w_1200,q_100/v"+result.heroImage.version+"/"+result.heroImage.public_id+"."+result.heroImage.format;
			} else {
			var img = result.images[0];
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,h_900,w_1200,q_100/v"+img.version+"/"+img.public_id+"."+img.format;
			}
			if (result.videoId) {
				 var videoId = getVideoId(result.videoId).id;
				 result.videoId = videoId;
			}
			locals.meta.canonical = req.url;
		});

	});

	view.on('post', { action: 'review' }, function(next) {
		var newReview = new Review.model(),
			updater = newReview.getUpdateHandler(req);
		updater.process(req.body, {
			flashErrors: true,
			fields: 'author, message, score, tour, name, email',
			errorMessage: 'There was a problem submitting your review:'
		}, function(err, data) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.reviewSubmitted = true;
        		return res.redirect('back');
			}
			next();
		});

	});

	function loadReviews(next){
		var r = keystone.list('Review').model.find({'tour': tourId})
    //.limit('3')
		.populate('author');
			r.exec(function(err, results) {
				locals.data.reviews = results;
				next(err);
			});

	}

	
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
