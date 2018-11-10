var keystone = require('keystone');
var async = require('async');


exports.home = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    locals.data = {
      bookings : [],
      user : req.user
	  };
    var username = req.user._id;

    view.on('init', function(next) {
				keystone.list('Enquiry').model.find({ user: username}).populate('tour').sort('-createdAt').exec(function(err, result) {
          if(result == null){ //si hay resultado
            }
          else {
            locals.data.bookings = result;
					  next();
			    }
		    });
		});

    view.render('user/home', {layout:"v2-admin"});
};
