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
	locals.price = {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;
	locals.data = {
		tour: [],
    	user : req.user
	};
	var tourId =  req.params.tourId;

	view.on('init', function(next) {
		if (req.body.date) {
			var date = req.body.date;
			locals.formData.date = Moment(req.body.date).format("YYYY-MM-DD");
	    locals.formData.formatDate = Moment(req.body.date).format("dddd, MMMM Do YYYY");
		}
		console.log(req.body.qtyInput);
		if (req.body.qtyInput) {
			var nOfAdults = req.body.qtyInput[0]; //adult data from form.
			var nOfChildren = req.body.qtyInput[1];
			var nOfInfants = req.body.qtyInput[2];

			nOfAdults = parseInt(nOfAdults);
			nOfChildren = parseInt(nOfChildren);
			nOfInfants = parseInt(nOfInfants);

			locals.data.nOfAdults = nOfAdults;
			locals.data.nOfChildren = nOfChildren;
			locals.data.nOfInfants = nOfInfants;

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

				var adultTotalPrice = nOfAdults * result.price;
				var childrenTotalPrice = nOfChildren * result.childPrice;
				var infantTotalPrice = nOfInfants * result.infantPrice;
		
				locals.price.adults = adultTotalPrice;
				locals.price.children = childrenTotalPrice;
				locals.price.infant = infantTotalPrice;
				locals.price.total = adultTotalPrice+childrenTotalPrice+infantTotalPrice;
				
				next(err);
			}
		});
	});

	view.render('booking');

};