var keystone = require('keystone');
var async = require('async');
var Email = require('../../utils').Email;
var q = require('q');
module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'tours';
	locals.filters = {
		category: req.params.category
	};
	locals.data = {
		tours: [],
		categories: [],
		provinces: [],
    homeImage: [],
	};



	function asyncFunc(countryId) { //Async func 
			return new Promise(
				function (resolve, reject) {
					var query = keystone.list('Tour')
					.paginate({
						page: req.query.page || 1,
						perPage: 4,
						maxPages: 1
					})
					.where('country',countryId)
					.where('state','published')
					.where('featured', true)
					.sort('-publishedDate')
					.populate('province categories city');

					query.exec(function(err, results) {
						if (!err){
						resolve(results);
						} else {
							reject(err);
						}
					});
				});
			};
	// Load the places
      
		view.on('init', function(next){

		asyncFunc ("5704494210326b0300cb6a2f")
		.then(function (results) {
			 locals.toursPanama = results;
			 return asyncFunc("58dec56592896d0400161fd3")
		})
		 .then(function (toursMexico) {
			 locals.toursMexico = toursMexico;
			 return asyncFunc("593ab9bd397cff0400419584")
		})
		.then(function (toursColombia){
			locals.toursColombia = toursColombia;
			next();
		});

    });
		
		


	view.on('init', function(next) {
		keystone.list('Province')
			.model.find()
			.exec(function(err, results) { //Query Pais
				if (err || !results) {

					return res.status(404);
				}
				locals.data.provinces = results;
				return next();

			});

	});
	view.on('init', function(next) {
		keystone.list('City')
			.model.find()
			.where('featured', true)
			.exec(function(err, results) { //Query Pais
				if (err || !results) {

					return res.status(404);
				}
				locals.data.cities = results;
				return next();

			});

	});

	view.on('init', function(next) {

		keystone.list('PostCategory').model.find().exec(function(err, results) { //Query Pais
			if (err || !results) {

				return res.status(404);
			}
			locals.data.categories = results;
			return next();

		});

	});

  view.on('init', function(next) {

		keystone.list('Country').model.find().exec(function(err, results) { //Query attractions
			if (err || !results) {

				return res.status(404);
			}
			locals.data.countries = results;
			return next();

		});

	});

  view.on('init', function(next){
    keystone.list('homeGallery').model.find()
    .exec(function(err, result){
      if (result){
        var id = Math.floor((Math.random() * result.length));
        locals.data.homeImage = result[id];
      }
      next();
    })
  });
	// Render the view
	view.render('index');
};
