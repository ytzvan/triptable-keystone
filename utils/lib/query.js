var keystone = require('keystone');
var async = require('async');

module.exports = {
	
	getCitiesFromCountry: function(countryId){
		var countryId = countryId;
		keystone.list('City')
		.model.aggregate([
		{'$match': {"country":countryId} },
	//	{ '$group' : { _id : "$featured", tours: { $push: "$$ROOT" },}}
		])
	 	.sort("-featured")
		.exec(function(err, results) { //Query Pais
			console.log("cities", results);
			if (err || !results) {
				return res.status(404);
			}
			return results;
		});
	},

	updateTourScore: function (tourId, score) {
		let review = keystone.list("Review");
		let tourScore = getTourScore(tourId);
		getTourReviewCount(tourId);
		return true;
	}
};

function getTourScore(tourId) {
	let Review = keystone.list("Review");
	Review.model
	.find({ tour: tourId })
	.count()
	//keystone.list('Tour').model.update({ "_id": tourId }, { $set: { nOfStars: nOfStars, nOfReviews: nOfReviews } })
	.exec(function(err, data) {
		if (err) {
			console.log(err);
			return false;
		} else {
			console.log(data);
			return true;
		}
	});
	
}

function getTourReviewCount(tourId) {
	console.log("getTourReviewCount", tourId);
	return true;
}