var keystone = require('keystone');
var async = require('async');
var Tour = keystone.list('Tour');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	let query = req.query;
	let searchQuery = {};
	if (query.q) {
		searchQuery.description_eng = query.q;
	}	
  locals.data = {
		tours: []
	};

  view.on('init', function(next) {
		console.log(searchQuery)
		Tour.model
				.find(searchQuery)
		//.find(query)
        .where("state","published")
        .sort('-publishedDate')
				.populate('city ')
				.exec(function(err, results) {
					console.log(results);
						results.currency = req.session.currency.currency;	
						locals.data.tours = results;
						next(err);
				});
			})


    view.render('search/country');

};