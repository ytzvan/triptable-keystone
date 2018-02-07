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
	}
};