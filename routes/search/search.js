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
			keystone.list('Tour')
				.paginate({
					page: req.query.page || 1,
					perPage: 18,
				})
		//.find(query)
        .where("state","published")
        .sort('-publishedDate')
				.populate('city ')
				.exec(function(err, results) {
						results.currency = req.session.currency.currency;	
						locals.data.tours = results;
						next(err);
				});
			})


    view.render('search/country');

};