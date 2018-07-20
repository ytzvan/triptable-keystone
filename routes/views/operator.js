var keystone = require('keystone');
var async = require('async');

exports.index = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    var userid = req.params.userid;

    view.on('init', function(next) {
      keystone.list('Tour').model.find({ 'owner': userid, 'state': 'published' }).populate('owner city').sort('-featured').exec(function(err, result) {
          if(result == null){ //si hay resultado
             console.log("sin bookings");
             return res.status(404).render('errors/404');
            }
          else {
            result.currency = req.session.currency.currency;
            locals.data.tours = result;
            locals.data.operator = result[0].owner;
					  next();
			    }
        });
		});

    view.render('operator');
};
