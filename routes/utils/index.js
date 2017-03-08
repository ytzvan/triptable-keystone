var keystone = require('keystone');
var async = require('async');
var Email = require('../../utils').Email;

exports.cartAbandon = function(req, res) {
   	console.log("query", req.query);
		if (req.user) {
			var obj = {};
			console.log("tour", req.query.tour);
			obj.tour = req.query.tour;
			obj.tourUrl = req.query.tourUrl;
			obj.name = req.user.name.first + " " + req.user.name.last;
			obj.email = req.user.email;
			Email.cartAbandonEmail(req, obj);
		}
    return true;

}

