var keystone = require('keystone');
var async = require('async');


exports.home = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    locals.data = {
      bookings : []
	  };
    var username = req.params.username;
    var User;


	  view.on('init', function(next) {
				keystone.list('User').model.findOne({ username: username }).exec(function(err, result) {
          if(result == null){ //si hay resultado
             return res.status(404).render('errors/404');
            }
          else {
            User = result;
            locals.data.user = result;
					  next();
			    }
		    });
		});

    view.on('init', function(next) {
				keystone.list('Enquiry').model.find({ owner: User._id }).exec(function(err, result) {
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
