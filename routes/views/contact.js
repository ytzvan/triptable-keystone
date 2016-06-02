/* Este controlador maneja el POST del booking */
var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'contact';
	locals.bookingStatus = Enquiry.fields.bookingStatus.ops;
	locals.formData = req.query || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;
	locals.data = {
		tour: [],
	};
	locals.bookingInfo = {};
	var tourId =  req.params.tourId;


	console.log("tourId", tourId);
	console.log("req", req);

	view.on('init', function(next) {

		var q = keystone.list('Tour').model.findOne({
			state: 'published',
			tourId: tourId
		}).populate('owner location');

		q.exec(function(err, result) {
			if (err) {
				console.log(err)
			} else {
				locals.data.tour = result;
				next(err);
			}
		});
	});

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'contact' }, function(next) {

		var newEnquiry = new Enquiry.model(),
			updater = newEnquiry.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, people, date, bookingStatus, tour, tourName, tourUrl, message, hotel, operatorEmail, operatorName, tourPrice, user',
			errorMessage: 'There was a problem submitting your booking:'
		}, function(err, data) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.bookingInfo = data;
				locals.enquirySubmitted = true;
			}
			next();
		});

	});

	view.render('bookingConfirmation');

};
