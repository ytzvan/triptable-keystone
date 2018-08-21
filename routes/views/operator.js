var keystone = require('keystone');
var async = require('async');

exports.index = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    var userid = req.params.userid;

    view.on('init', function(next) {
      keystone.list('Tour').model.find({ 'owner': userid, 'state': 'published' }).populate('owner city').sort('-featured').exec(function(err, result) {
          if(result == null){ //si hay resultado
             return res.status(404).render('errors/404');
            }
          else {
            try {
            result.currency = req.session.currency.currency;
            locals.data.tours = result;
            locals.data.operator = result[0].owner;
              next();
            } catch (e) {
              return res.redirect(301, "/");
            }
					  
			    }
        });
		});

    view.render('operator');
};
