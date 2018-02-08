var keystone = require('keystone');
var async = require('async');
var Email = require('../../utils').Email;
var currencies = [];
currencies = ["USD", "EUR", "COP", "CNY", "BRL"];
exports.cartAbandon = function(req, res, next) {
		if (req.user) {
			var obj = {};
			console.log("tour", req.query.tour);
			obj.tour = req.query.tour;
			obj.tourUrl = req.query.tourUrl;
			obj.name = req.user.name.first + " " + req.user.name.last;
			obj.email = req.user.email;
			Email.cartAbandonEmail(req, obj);
			console.log("email enviado");
			return next();
		}
    return true;

}

exports.setCurrency = function(req, res, next) {
	let params = req.params;
  	let locals = res.locals;
  	let appData = keystone.app.locals;

    if (currencies.includes(params.currency)) {	
    	appData.currency = params.currency; 
      	res.redirect('back');
    } else {
 		params.currency = "USD";
      	appData.currency = "USD";
      	res.redirect('back');
     
    }
  };


