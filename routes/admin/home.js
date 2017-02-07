var keystone = require('keystone');
var async = require('async');


exports.index = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    locals.data = {
      bookings : [],
      operator : req.user
	  };
    var operator = req.user._id;

    view.on('init', function(next) {
				keystone.list('Enquiry').model.find({ operator: operator}).sort('-createdAt').exec(function(err, result) {
          if(result == null){ //si hay resultado
            }
          else {
            locals.data.bookings = result;
					  next();
			    }
		    });
		});

    view.render('admin/index');
};
