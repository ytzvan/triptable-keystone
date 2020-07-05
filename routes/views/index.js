var keystone = require('keystone');
var async = require('async');
var Email = require('../../utils').Email;
var q = require('q');
var request = require('request');

module.exports = function (req, res) {

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
				var query = keystone.list('Tour').model.find()
					.where('country', countryId)
					.where('state', 'published')
					.where('featured', true)
					.sort('-publishedDate')
					.populate('province categories city')
					.limit(8);

				query.exec(function (err, results) {
					if (!err) {
						results.currency = req.session.currency.currency;
						resolve(results);
					} else {
						reject(err);
					}
				});
			});
	};
	// Load the places

 	view.on('init', function (next) {
		asyncFunc("5704494210326b0300cb6a2f")
			.then(function (results) {
				locals.toursPanama = results;
				console.log(locals.toursPanama);
				return asyncFunc("593ab9bd397cff0400419584")
			})
			.then(function (toursColombia) {
				if (toursColombia) {
					locals.toursColombia = toursColombia;
				}
				return asyncFunc("58dec56592896d0400161fd3")
			})
			.then(function (toursMexico) {
				if (toursMexico) {
					locals.toursMexico = toursMexico;
				}
				next();
			});

	}); 
	view.on('init', function (next) {
		keystone.list('City')
			.model.find()
			.where('featured', true)
			.sort('-updatedAt')
			.limit(8)
			.exec(function (err, results) { //Query Pais
				if (err || !results) {

					return res.status(404);
				}
				locals.data.cities = results;
				return next();

			});

	});

	view.on('init', function (next) {

		keystone.list('Country').model.find().exec(function (err, results) { //Query attractions
			if (err || !results) {

				return res.status(404);
			}
			locals.data.countries = results;
			return next();

		});

	});

	view.on('init', function (next) {
		keystone.list('homeGallery').model.find()
			.exec(function (err, result) {
				if (result) {
					var id = Math.floor((Math.random() * result.length));
					locals.data.homeImage = result[id];
				}
				next();
			})
	});

	/*	view.on('init', function (next) {
			let excursions = keystone.list('Tour')
				.model.where({ "isExcursion": true, "state": "published" })
				.populate('city')
				.exec((err, excursions) => {
					if (!err) {
					//	console.log(excursions);
						locals.data.excursions = excursions;
					} else {
						console.log("error", err);
					}
					next();
				});
		})*/

	/*view.on('init', function(next){
		let url = "https://blog.triptable.com/wp-json/wp/v2/posts?per_page=3";
		request(url, function(err, result){
			var json = result.body;
			var obj = (JSON.parse(json));
		})
		next();
	}); */
	// Render the view
		view.render('../v3/index', { layout: 'home-layout' });
	//view.render('index')
};