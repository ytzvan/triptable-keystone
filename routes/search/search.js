var keystone = require('keystone');
var async = require('async');
var Tour = require('keystone').List('Tour');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
  	var query = req.query;

  locals.data = {
		tours: []
	};

  view.on('init', (next) => {
	var countrySlug = req.params.country;
	var countryname = getCountryIdFromSlug(countrySlug)
	
	var page = req.query.page;
	
	var index;
	var limit = 18;
	console.log(countrySlug);
	if (page) {
		index = page * limit;
	} else {
		index = limit;
	}
	var q = keystone.list('Tour').model.find({
		state: 'published',
		country : "5704494210326b0300cb6a2f"
	//	slug: locals.filters.tour
	})
	.limit(limit)
	.skip(index)
	.populate('province city country')
	.sort('-publishedDate');
	q.exec(function(err, results) {
		locals.data.tours = results;
		locals.data.tours.currency = req.session.currency.currency;
		next();
	});
	//	next();
	/*	Tour.List.model.find()
    //    .where("state","published")
				.populate('city ')
				.exec(function(err, results) {
						results.currency = req.session.currency.currency;	
						locals.data.tours = results;
						next(err);
				}); */
			}) 


	view.render('search/country');
	
	function getCountryIdFromSlug(slug) {
		var q = keystone.list('Country').model.findOne ({
			'slug':slug
		});
		q.exec( (error, countryname) => {
			if (error) {
				res.redirect('errors/404')
			}
			return countryname.countryId;
		});
	}

};