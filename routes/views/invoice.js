var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    locals.data = {
      enquiry : [],
      user : req.user
	  };
    var username = req.user._id;
    var enquiryId = req.query.enquiryId;

    view.on('init', function(next) {
				keystone.list('Enquiry').model.findOne({ _id: enquiryId}).exec(function(err, enquiry) {
          if(enquiry == null){ //si hay resultado
             console.log("sin bookings")
            }
          else {
            locals.data.enquiry = enquiry;
					  next();
			    }
		    });
		});
    view.render('enquiry', {layout:'landing'});
}