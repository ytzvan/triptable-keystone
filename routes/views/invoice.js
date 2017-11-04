var keystone = require('keystone');
var async = require('async');
var moment = require('moment');
exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    locals.data = {
      enquiry : [],
      user : req.user
	  };

    var enquiryId =  req.params.enquiryId;
    console.log(enquiryId);
    view.on('init', function(next) {
				keystone.list('Enquiry').model.findOne({ _id: enquiryId}).populate('operator tour').exec(function(err, enquiry) {
          if(enquiry == null){ //si hay resultado
             console.log("sin bookings");
             return res.send('404');
            }
          else {
            locals.data.enquiry = enquiry;
            locals.data.enquiry.friendlyDate = moment(locals.data.enquiry.createdAt).format("MM/DD/YYYY");
            locals.data.enquiry.adultTotalPrice = enquiry.nOfAdults * enquiry.tourPrice;
            locals.data.enquiry.childrensTotalPrice = enquiry.nOfChildren * enquiry.childPrice;
            locals.data.enquiry.infantsTotalPrice = enquiry.nOfInfants * enquiry.infantPrice;
					  next();
			    }
		    });
		});
    view.render('invoice', {layout:null});
}