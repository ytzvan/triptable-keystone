var keystone = require('keystone');
var async = require('async');
var QueryUtils = require('../../utils').QueryUtils;
var cityId;
const Url = require('url');
exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	let searchQuery = {};
	//req.query
	if (req.query.hotel_pickup) {
		searchQuery.hotelPickup = true;
	}
	console.log(searchQuery);
	if (req.query.multiday) {
		searchQuery.isMultiDay = true; //Only Tour + Stay Package: Packages always have a place to sleep. 
	}
	console.log(searchQuery);
	if (req.query.transportation) {
		searchQuery.isTransport = true;
	}
	console.log(searchQuery);
	if (req.query.group_excursions) {
		searchQuery.isExcursion = true;
	}
	console.log(searchQuery);

	if (req.query.range) {
		let range = req.query.range;
		let split = range.split(';');
		let minPrice = split[0];
		let maxPrice = split[1];
	//	searchQuery.price = { $gte: minPrice};
	searchQuery.price = { $gte: minPrice, $lte: maxPrice};
	}
	const sortQuery = {};
	const sort = req.query.sort;
	console.log("sort", sort);
	if (sort) {
		if (sort == 0) {
			sortQuery.mostSell = -1;
			sortQuery.featured = -1;
		}
		if (sort == 1) { // Sort From low - to high price
			console.log("sort by lowest Price");
			sortQuery.price = 1;
		}
		if (sort == 2) { // Sort from High Price - to Low
			sortQuery.price = -1;
		}
		if (sort == 3) { // Sort from Latest added / updated
		}
		sortQuery.publishedDate = -1;
	} else {
		sortQuery.mostSell = -1;
		sortQuery.featured = -1;
		sortQuery.publishedDate = -1;
	}
	searchQuery.state = "published";
	console.log(searchQuery);
	// Init locals
	locals.section = 'city';
	locals.data = {
		cities: [],
		tours: [],
		categories : [],
		provinces : [],
    filters: [],
    country : req.params.country
	};
	locals.data.filter = req.query.filter;

	locals.data.province;
	locals.data.place;
	locals.meta = {};
	var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
	query = {
		'slug' : req.params.city,
	};
	locals.data.city = req.params.city;
	locals.data.url = url;

	view.on('init', function(next) {
		keystone.list('City').model.findOne(query)
	//	.populate('country collections')
		.populate({
			path: 'country collections',
		//	match: { featured: { $equals: true } },
		//	select: 'slug title image.version image.public_id image.format image.secure_url',
			options: { limit: 5}
		//	select: 'name',
			/*	populate: {
					path: 'tours'
				}*/
			}
		)
		.exec(function(err, place) { //Query tours from city

			if (err || !place) {
				return res.status(404).render('errors/404');
			}
			locals.data.place = place;
			locals.data.cityName = place.city;
			
			var id = place._id;
			cityId = place._id;
			var cityName = locals.data.cityName;
			locals.data.country = place.country.slug;
			var countryName = place.country.country;
			locals.data.countryName = place.country.country;
			locals.data.collections = place.collections;

			keystone.list('City') //Get other cities from country
			.model.aggregate([
			{'$match': {"country":place.country._id} },
		//	{ '$group' : { _id : "$featured", tours: { $push: "$$ROOT" },}}
			])
		 	.sort("city")
			.exec(function(err, results) { //Query Pais
				if (err || !results) {
					return res.status(404);
				}
				locals.data.cities = results;
			});
			let placeTitle = cityName + ", " + countryName;
			if (process.env.LANG == "es") {

				if (place.seoES.title) {
					locals.meta.title = place.seoES.title;
				} else {
					locals.meta.title = "Tours en " + cityName + ". Actividades, Excursiones y Qué hacer en " + cityName;
				}

				if (place.seoES.description) {
					locals.meta.description = place.seoES.description;
				} else {
					locals.meta.description = "Tours en " + cityName + ". Reserva Excursiones, Actividades y tours en " + placeTitle + ". Opiniones reales de " + cityName + ". Precio más bajo en Triptable.com";
				}

				locals.meta.keywords = cityName + ", tours en " + cityName + ", que hacer en " + cityName + ", actividades en " + cityName + ", excursiones en " + cityName + ", experiencias " + cityName; // Remover defaults en Layout
				locals.meta.ogTitle = locals.meta.title + " | Triptable.com";
				locals.meta.ogDescription = locals.meta.description;
			
			}

			if (process.env.LANG == "en" || !process.env.LANG) {

				if (place.seoEN.title) {
					locals.meta.title = place.seoEN.title;
				} else {
					locals.meta.title = cityName + " Tours. Activities, Excursions and Things to Do in " + cityName;
				}

				if (place.seoEN.description) {
					locals.meta.description = place.seoEN.description;
				} else {
					locals.meta.description = cityName + " Tours. Book Excursions, Activities and tours in " + placeTitle + ". Real opinions about " + cityName + ". Lowest Prices in Triptable.com";
				}

				locals.meta.keywords = "tours " + cityName + ", things to do " + cityName + ", activities in " + cityName + ", tourism in " + cityName + ", travel " + cityName + ", trips " + cityName;
				locals.meta.ogTitle = locals.meta.title + " | Triptable.com";
				locals.meta.ogDescription = locals.meta.description;
			}

			locals.meta.canonical = req.url;
			if (place.image) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/w_900/v"+place.image.version+"/"+place.image.public_id+"."+place.image.format;
			}
			let limit = 10; // tours per page
			let page = req.query.page || 1;
			let skip;
			page = parseInt(page);
			if (page !== 1 ) {
				skip = page * limit - limit;
				console.log("skip",skip);
				console.log("page",page);
			} else {
				skip = 0;
				console.log("skip", skip);
			}
			locals.data.currentPage = page;
			let count;
			keystone.list('Tour').model.count({
				"state": "published",
				"city": cityId
			}, function (err, c) {
					console.log("count ", c);
					console.log("pages ", c/limit);
					let pages = c / limit;
					count = Math.floor(pages) + 1;
					locals.data.pages = count;
					return count = c;
			});
			var q = keystone.list('Tour').model
					//	.paginate({page: req.query.page || 1, perPage: 10})
						.find(searchQuery)
						.where("city", id)
						.limit(limit)
						.skip(skip)
				//		.sort('-publishedDate')
						.sort(sortQuery)
						.populate('province country categories city')
					if (locals.data.filter) {
							q.where('collections', locals.data.filter)
							locals.data.activeCollection = locals.data.filter;

						}
	  			q.exec(function(err, results) {
						const tourTotal = results.length;
	  				var origin = req.get('origin');
						let base = req.path;
						
	  				if (results.next) {
	  					locals.meta.nextUrl = base+"?page="+results.next;
	  				}
	  				if (results.previous) {
	  					locals.meta.prevUrl = base+"?page="+results.previous;
						}


						results.currency = req.session.currency.currency;
	  				locals.data.tours = results;
	  				next(err);
	  			});
			});

	});

	// Load the current category filter

	// Load the posts


	// Render the view
	view.render('../v3/search/destination', { layout: 'v3' });

};
