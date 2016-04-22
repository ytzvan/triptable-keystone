/* Este controlador hace el GET del booking */
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
		tour: []
	};
	var tourId =  req.params.tourId;
	

	console.log("tourId", tourId);
	console.log("Formdata", locals.formData);

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

	view.render('contact');
	
};	