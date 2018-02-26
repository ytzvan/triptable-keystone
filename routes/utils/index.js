var keystone = require('keystone');
var async = require('async');
var Email = require('../../utils').Email;
var currencies = [];
currencies = ["USD", "EUR", "COP", "CNY", "BRL", "MXN"];
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
    locals.session = {};
    if (currencies.includes(params.currency)) {	
    	var sessionObj = {currency : params.currency};  //set new value
    	req.session.currency = sessionObj;
      locals.session.userCurrency = req.session.currency.currency;
 		console.log("current currency new set", req.session.currency)
      	res.redirect('back');
    } else {
    	var sessionObj = {currency : "USD"};  //setting fallback
    	req.session.currency = sessionObj;
    	console.log("current currency set", req.session.currency)
      	res.redirect('back');
     
    }
  };


