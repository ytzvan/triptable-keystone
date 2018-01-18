var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
  var query = req.query;

  locals.data = {
		tours: []
	};

  view.on('init', function(next) {
      console.log("on search");
			keystone.list('Tour')
				.paginate({
					page: req.query.page || 1,
					perPage: 20,
				})
        .find({"state": "published"})
	  //		.where("country", id)
        .sort('-publishedDate')
				.populate('city ')
				.exec(function(err, results) {
						locals.data.tours = results;
						next(err);
				});
			})


    view.render('search/country');

};