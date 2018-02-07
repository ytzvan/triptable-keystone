var keystone = require('keystone');
var async = require('async');
var Email = require('../../utils').Email;

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
  	let curr = params.currency;
  	if (!process.env.CURRENCY){
     process.env.CURRENCY = "USD";
     next();
  } else {
    console.log(params);
    if (params.currency == undefined || params.currency == 'undefined') {
      params.currency = "USD";
      process.env.CURRENCY = "USD";
      res.redirect('back');
    } else {
      process.env.CURRENCY = params.currency;
      res.redirect('back');
    }
  }
}

