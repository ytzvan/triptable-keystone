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
				keystone.list('Enquiry').model.find({ user: username}).exec(function(err, result) {
          if(result == null){ //si hay resultado
             console.log("sin bookings")
            }
          else {
            locals.data.bookings = result;
					  next();
			    }
		    });
		});

    view.render('user/home');
};
