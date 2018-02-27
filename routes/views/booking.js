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
	locals.formData = req.query || {};
	//locals.formData = req.body || {};
	locals.price = {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;
	locals.data = {
		tour: [],
    	user : req.user
	};
	var tourId =  req.params.tourId;

	view.on('init', function(next) {
		if (req.query.date) {
			var date = req.query.date;
			locals.formData.date = Moment(req.query.date).format("YYYY-MM-DD");
	    locals.formData.formatDate = Moment(req.query.date).format("dddd, MMMM Do YYYY");
		}
		console.log("PARAMS", req.params);
		console.log("nofadults", req.query.nOfAdults);
		if (req.query.nOfAdults) {
			var nOfAdults = req.query.nOfAdults; //adult data from form.
			var nOfChildren = req.query.nOfChildren;
			var nOfInfants = req.query.nOfInfants;

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
				result.currency = req.session.currency.currency;
				locals.data.tour = result;
				locals.data.userInfo = req.user;

				if (locals.data.tour.multiPrice){
         var tourPrice = getPrice(nOfAdults, locals);
      	} else {
        	var tourPrice = result.price;	
				}
				locals.price.adultsPrice = tourPrice;
				var adultTotalPrice = nOfAdults * tourPrice;

				if (result.childPrice) {
					var childrenTotalPrice = nOfChildren * result.childPrice;
				} else {
					var childPrice = 0;
					var childrenTotalPrice = nOfChildren * childPrice;
				}
				if (result.infantPrice) {
					var infantTotalPrice = nOfInfants * result.infantPrice;
				} else {
					var infantPrice = 0;
					var infantTotalPrice = nOfInfants * infantPrice;
				}
				locals.price.adults = adultTotalPrice;
				locals.price.children = childrenTotalPrice;
				locals.price.infant = infantTotalPrice;
				locals.price.subtotal = adultTotalPrice+childrenTotalPrice+infantTotalPrice;
				//Processor fees
				var processorTax = 3.9; // % del procesador
				var processorFee = 0.30; // fee individual por transaccion

				var taxPrice = locals.price.subtotal * processorTax / 100; // cantidad en $$ que se lleva el gateway sin el fee
				locals.price.transacctionFee = taxPrice + processorFee;
				locals.price.total = locals.price.subtotal + locals.price.transacctionFee;
				locals.price.priceInUSD = locals.price.total.toFixed(2);
				
				next(err);
			}
		});
	});

	function getPrice(travelers, locals){
      var priceCatalog = [];
//      console.log(locals.data.tour.multiPriceCatalog)
      for (var i=0; i<locals.data.tour.multiPriceCatalog.length; i++) {
      var current = locals.data.tour.multiPriceCatalog[i].split(',');
        for (var index=0;index < current.length;index++){
          current[index] = parseInt(current[index]);
        }
        priceCatalog.push(current);
        }
        for (var i = 0; i< priceCatalog.length; i++){
          if (isNaN(priceCatalog[i][0])) {
            priceCatalog[i][0] = locals.data.tour.minPerson;
        }
          if (isNaN(priceCatalog[i][1])) {
            priceCatalog[i][1] = locals.data.tour.maxPerson;
         }
         //if logic
				 console.log("priceCatalog",priceCatalog);
         if (travelers >= priceCatalog[i][0] && travelers <= priceCatalog[i][1]){
           var pricePerTraveler = priceCatalog[i][2];
           return pricePerTraveler;
         } else {
          	console.log("error");
         }
        } // end for
      } //end func

	view.render('booking');

};