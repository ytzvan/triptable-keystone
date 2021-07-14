var keystone = require('keystone');
var async = require('async');
var Tour = keystone.list('Tour');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.data.currency = req.session.currency.currency
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
		let sortQuery = {
			score: { $meta: 'textScore' }
		};
		const sort = req.query.sort;
		if (sort) {
			if (sort == 0) {
				sortQuery.mostSell = -1,
				sortQuery.featured =  -1,
				sortQuery.nOfReviews = -1,
				sortQuery.updatedAt =  -1,
				sortQuery.publishedDate = -1
			}
			if (sort == 1) { // Sort From low - to high price
				sortQuery = {};
				sortQuery = {
					score: { $meta: 'textScore' },
					price: 1
				};
			}
			if (sort == 2) { // Sort from High Price - to Low
				sortQuery.price = -1;
			}
			if (sort == 3) { // Sort from Latest added / updated
				sortQuery.publishedDate = -1;
			}
		} else {
			sortQuery.mostSell = -1;
			sortQuery.nOfReviews = -1;
			sortQuery.featured = -1;
			sortQuery.publishedDate = -1;
		}
	//	console.log("sort", sort);
	//	console.log("search query", searchQuery.name)
		Tour.model
				.find(
					{ $text: { $search: searchQuery.name } },
					{ score: { $meta: "textScore" } }
				)
				.where("state", "published")
				.limit(10)
			//	.sort({  })
				.sort(sortQuery)
				.populate('city country')
				.exec(function(err, results) {
				//	if (results) {
		//				console.log(results)
					//	results.currency = req.session.currency.currency;
					try {
					locals.data.tours = results;
					locals.data.tours.currency = req.session.currency.currency;
					next(err);
					} catch (e) {
						console.log("empty results", e );
						next(err);
					}
				/*	} else {
						console.log("no tours found");
						next();
					}*/
					// } catch (e) { 
					//	 console.log("no tours found");
				//		 next(err);} 	
				});
			})


		view.render('../v3/search/search', { layout: 'v3' });

};