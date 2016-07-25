var keystone = require('keystone');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post
	};
  locals.meta = {};
  var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
	locals.data = {
		posts: []
	};

	// Load the current post
	view.on('init', function(next) {

		var q = keystone.list('Post').model.findOne({
			state: 'published',
			slug: locals.filters.post
		}).populate('author categories');

		q.exec(function(err, result) {
			locals.data.post = result;

      locals.meta.title = result.title + " - Triptable";
			locals.meta.keywords = "blog, viajes, travel, " + result.keywords;
			locals.meta.description = result.brief;
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogType = "article";
			locals.meta.ogDescription = locals.meta.description;
			var img = result.image;
			if (img) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,h_400,w_600,q_75/v"+img.version+"/"+img.public_id+"."+img.format;
			}
			next(err);
		});

	});

	// Load other posts
	view.on('init', function(next) {

		var q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

		q.exec(function(err, results) {
			locals.data.posts = results;
			next(err);
		});

	});

	// Render the view
	view.render('post');

};
