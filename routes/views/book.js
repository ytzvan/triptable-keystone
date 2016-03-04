var keystone = require('keystone');
var Booking = keystone.list('Booking');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'booking';
	locals.bookingTypes = Booking.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;
	
	// On POST requests, add the Booking item to the database
	view.on('post', { action: 'contact' }, function(next) {
		
		var newBooking = new Booking.model(),
			updater = newBooking.getUpdateHandler(req);
		
		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, bookingType, message',
			errorMessage: 'There was a problem submitting your booking:'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.bookingSubmitted = true;
			}
			next();
		});
		
	});
	
	view.render('bookingConfirmation');
	
};
