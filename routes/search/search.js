var keystone = require('keystone');
var async = require('async');
var Tour = keystone.list('Tour');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	let query = req.query;
	let searchQuery = {};
	if (query.q) {
		searchQuery.name = query.q;
	}	else {
		searchQuery.name = "";
	}
  locals.data = {
		tours: [],
		searchTitle : query.q
	};

  view.on('init', function(next) {
		console.log(searchQuery.name)
		const sortQuery = {};
		const sort = req.query.sort;
		console.log("sort", sort);
		if (sort) {
			if (sort == 0) {
				sortQuery.mostSell = -1,
				sortQuery.featured =  -1,
				sortQuery.nOfReviews = -1,
				sortQuery.updatedAt =  -1,
				sortQuery.publishedDate = -1
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
			sortQuery.nOfReviews = -1;
			sortQuery.featured = -1;
			sortQuery.publishedDate = -1;
		}
		Tour.model
			/*	.where("state","published")
				.sort("-createdAt")
				.limit(10)*/
			.aggregate([
				{
					$match: {
						state: 'published',
						$or: [
							{
								name: {
									$regex: searchQuery.name,
									$options: 'si'
								}
							},
						{
							keywords: {
								$regex: searchQuery.name,
								$options: 'mis'
							}
						},
							{
								'description.extended': {
									$regex: searchQuery.name,
									$options: 'mis'
								}
							}
					]
				}	
			},
				{
					$sort: sortQuery
				},
				{ $limit: 20},
		])
				.exec(function(err, results) {
					console.log("res", results.name);
					 try {
						results.currency = req.session.currency.currency;	
						locals.data.tours = results;
						 next(err);
					 } catch (e) { next(err);}
						
				});
			})


		view.render('../v3/search/search', { layout: 'v3' });

};