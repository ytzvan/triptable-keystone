/* Este controlador maneja el POST del booking */
var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');
var request = require('request');

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

	view.on('post', {action: 'booking'}, function(next) {
		console.log(req.body);
	    var body = req.body;
		var result;
		var response;
		var options = { method: 'POST',
		  url: 'https://gatewaysandbox.merchantprocess.net/transaction.aspx',
		  qs: 
		   { AccCode: '123123',
		     procCode: '000000',
		     merchant: '100177',
		     terminal: '100177001',
		     cardNumber: body.cardNumber,
		     expiration: body.expiration,
		     amount: '34.00',
		     currencyCode: '840',
		     cardHolder: 'cardholdername',
		     cvv2: body.cvv2 }
		};
		
		request(options, function (error, response, body) {
		  if (error) throw new Error(error);
				
		  result = body;
		  response = result.split('~');
		  var status = response[0];
		  console.log(status);
		  if (status != 00) {
		    return res.status(500).render('errors/404');
		  } else {
		  	createBooking(next);
		  }
		  
		});
		
	});

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
	function createBooking(next){

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

	};

	view.render('bookingConfirmation');

};
