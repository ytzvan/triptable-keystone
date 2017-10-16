/* Este controlador hace el GET del booking */
var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');
var Moment = require('moment');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'contact';
	locals.bookingStatus = Enquiry.fields.bookingStatus.ops;
	//locals.formData = req.query || {};
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;
	locals.data = {
		tour: [],
    	user : req.user
	};
	var tourId =  req.params.tourId;
	console.log("data",req.body);
	view.on('init', function(next) {
		if (req.body.qtyInput) {
			locals.formData.nOfAdults = req.body.qtyInput[0];
			locals.formData.nOfChildren = req.body.qtyInput[1];
			locals.formData.nOfInfants = req.body.qtyInput[2];
		}
		if (req.body.date) {
			locals.formData.formatDate = Moment(req.body.date).format("dddd, MMMM Do YYYY");
		}

		var q = keystone.list('Tour').model.findOne({
			//state: 'published',
			tourId: tourId
		}).populate('owner city country location');

		q.exec(function(err, result) {
			if (err) {
				
			} else {
				locals.data.tour = result;
				locals.data.userInfo = req.user;
				next(err);
			}
		});
	});

	view.render('booking');

};