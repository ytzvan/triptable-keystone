var keystone = require('keystone');
var Booking = keystone.list('Booking');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'booking';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.bookingSubmitted = false;

	// On POST requests, add the Booking item to the database
	view.on('post', { action: 'booking' }, function(next) {
		
		var newBooking = new Booking.model(),
			updater = newBooking.getUpdateHandler(req);
		
		updater.process(req.body, {
			flashErrors: true,
			fields: 'date, people',
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
