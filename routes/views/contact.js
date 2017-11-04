/* Este controlador maneja el POST del booking */
var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');
var request = require('request');
var extend = require('extend');
var Keen = require('keen-js');
var moment = require('moment');
var Sms = require('../../utils').Sms;
var Email = require('../../utils').Email;
var TourModel;
var client = new Keen({
    projectId: "577145c107271968d3a2107d", // String (required always)
    writeKey: "5f180e718b659d108d1517d2be385b5e5c2f9740dc0758649d78935f971c27fb77f1d7462a33c1e2dca28ba69d63e61fd357a5b348ad5c325a66bab2ecbb58f8011cc0d765bfa6a48d483a7b582a247e13786047447585db3db1144d65d6fb9b",   // String (required for sending data)
    readKey: "5887be55748985be44af2f0ac6dbb041a7f122865b17080f8acf237991e2cc49feb1b7fdfc2ec204988fdbca4dfd6963a057f6dc4424b071c2ac2f58b041b82adf885d424309c744d6cc346a41e6126d52ae0e5e9dfeb5832c485406e8f3c4f4",      // String (required for querying data)

    protocol: "https",         // String (optional: https | http | auto)
    // host: "api.keen.io/3.0",   // String (optional)
    // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
});
exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'contact';
	locals.bookingStatus = Enquiry.fields.bookingStatus.ops;
	locals.formData = req.query || {};
	locals.validationErrors = {};
	locals.transactionErrors = {};
	locals.enquirySubmitted = false;
	locals.data = {
		tour: [],
	};
	locals.bookingInfo = {};
	var tourId =  req.params.tourId;
	var updateBody = {};
	var transactionInfo = {};

	view.on('post', {action: 'booking'}, function(next) {
		console.log("body", req.body);
	    var body = req.body;
		  var result;
		  var response;

        var invalidTravelers = isNaN(req.body.nOfAdults);
         if (invalidTravelers){
		  	 var errorMessage = "Número de Viajeros inválido";
		  	req.flash('error', errorMessage);
		  	console.log('error', errorMessage);
		    return res.status(500).render('errors/404');
		   // return next();
		  }
		//Here goes the payment logic
      var travelers = req.body.nOfAdults;
      travelers = parseInt(travelers);
      var nOfChildren = req.body.nOfChildren;
      nOfChildren = parseInt(nOfChildren);
     
      var nOfInfants = req.body.nOfInfants;
      nOfInfants = parseInt(nOfInfants);

      var childrenPrice = nOfChildren * locals.data.tour.childPrice;
      var infantsPrice = nOfInfants * locals.data.tour.infantPrice;

			var totalPeople = travelers + nOfChildren + nOfInfants;

      if (locals.data.tour.multiPrice){
         var tourPrice = getPrice(travelers, locals);
				 var cost = getCost(travelers, locals);
      } else {
        var tourPrice = locals.data.tour.price;
					if (locals.data.tour.cost) {
					var cost = locals.data.tour.cost;
				} else {
					cost = 0;
				}
      };
      body.tourPrice = tourPrice;
      req.body.tourPrice = tourPrice;
	    var flatPrice = tourPrice * travelers; // precio individual del tour * cantidad de viajeros
	    flatPrice = flatPrice + childrenPrice + infantsPrice;
	    var processorTax = 4; // % del procesador
	    var processorFee = 0.30; // fee individual por transaccion
      if (locals.data.tour.comission){
        var commisionPercentaje = locals.data.tour.comission; //porcentaje de commision que nos llevamos nosotros
      } else {
        var commisionPercentaje = 15;
      }
			
			cost = cost * travelers;
			var tourOperatorCost = cost;
	
				var commision = flatPrice * commisionPercentaje / 100; //Deprecated
				var revenue = commision;
		
	    var taxPrice = flatPrice * processorTax / 100; // cantidad en $$ que se lleva el gateway sin el fee
	    var transactionCost = taxPrice + processorFee; // cantidad a pagarle al gateway por la transaccion
	    var totalPrice =  flatPrice + taxPrice + processorFee; // costo total de la transacción

	    totalPrice = totalPrice.toFixed(2);
	    commision = commision.toFixed(2);
	    flatPrice = flatPrice.toFixed(2);
	    tourOperatorCost = tourOperatorCost.toFixed(2);
	    taxPrice = taxPrice.toFixed(2);
	    transactionCost = transactionCost.toFixed(2);
		 updateBody = {
	    	bookingTotalPrice : totalPrice,
	    	bookingFlatPrice : flatPrice,
	    	bookingTransactionFee : transactionCost,
	    	bookingOperatorFee : tourOperatorCost,
	    	bookingRevenue : revenue,
        bookingComission : commisionPercentaje,
				people : totalPeople
	    };
//		var finalObj = {};
		extend(updateBody, req.body);
      var cardNumber = body.cardNumber;
      cardNumber = cardNumber.replace(/ /g,'');
      var cardDate = body.expiration;
      cardDate = moment("01/"+body.expiration,"DD-MM-YYYY");
      var formatDate = cardDate.format("MMYY");
      cardDate = formatDate;
		  var options = { method: 'POST',
      proxy: process.env.QUOTAGUARDSTATIC_URL,
      headers: {
        'User-Agent': 'node.js'
      },
		  url: process.env.METROPAGO_URL,
		  qs:
		   { AccCode: process.env.METROPAGO_ACCCODE,
		     procCode: process.env.METROPAGO_PROCCODE,
		     merchant: process.env.METROPAGO_MERCHANT,
		     terminal: process.env.METROPAGO_TERMINAL,
		     cardNumber: cardNumber,
		     expiration: cardDate,
		     amount: totalPrice,
		     currencyCode: '840',
		     cardHolder: body.cardholder,
		     cvv2: body.cvv2 }
		};
		request(options, function (error, response, body) {
		  if (error) {
				debugger;
				throw new Error(error);
			}

		  result = body;
		  response = result.split('~');
		  var status = response[0];

		  transactionInfo = {
		  	transactionResponseCode : response[0],
		  	transactionReference : response[1],
		  	transactionAuthorizationNumber : response[2],
		  	transactionTime : response[3],
		  	transactionDate : response[4],
		  	transactionBallot : response[5],
		  }
		  extend(updateBody, transactionInfo);

		  if (status == 116){
		  	var errorMessage = "Número de tarjeta inválido, por favor verifíque.";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
				
		  }
		  if (status == 107){
		  	var errorMessage = "Nombre del propietario de la tarjeta es requerido, por favor verifíque.";
		  	req.flash('error', errorMessage);
				console.log('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 110){
		  	var errorMessage = "Tipo de tarjeta inválida, por favor ingrese una tarjeta VISA o MASTERCARD";
		  	req.flash('error', errorMessage);
				console.log('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 999){
		  	var errorMessage = "Error de sistema, no hemos cobrado nada a su cuenta, por favor intente de nuevo";
		  	req.flash('error', errorMessage);
				console.log('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 117){
		  	var errorMessage = "Tarjeta expirada, por favor introduzca una tarjeta válida";
		  	req.flash('error', errorMessage);
				console.log('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 105){
				console.log('error', errorMessage);
		  	var errorMessage = "El CVV es necesario";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status != 00) {
				console.log('error', errorMessage);
		  	var errorMessage = "Hubo un problema al procesar su transacción, por favor intente nuevamente";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		   	return res.redirect(req.get('referer'));
		  } else {
	    	console.log("update body", updateBody);				
		  	createBooking(next, updateBody);
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
				TourModel = result;
				next(err);
			}
		});
	});

	// On POST requests, add the Enquiry item to the database
	function createBooking(next, updateBody){
		var newEnquiry = new Enquiry.model(),
			updater = newEnquiry.getUpdateHandler(req);
		updater.process(updateBody, {
			flashErrors: true,
			fields: 'name, email, phone, people, nOfAdults, nOfChildren, nOfInfants, childPrice, infantPrice, date, bookingStatus, tour, tourName, tourUrl, message, hotel, operatorEmail, operatorName, operator, operatorCellphone, tourPrice, user, bookingTotalPrice, bookingFlatPrice, bookingTransactionFee, bookingOperatorFee, bookingRevenue, bookingComission, transactionResponseCode, transactionReference, transactionAuthorizationNumber, transactionTime, transactionDate, transactionBallot',
			errorMessage: 'There was a problem submitting your booking:'
		}, function(err, data) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				if (process.env.NODE_ENV == 'production') {
        	Email.sendPendingConfirmationEmail(data);
					recordEvent(data);
        	Sms.sendSms(data);
				}
				locals.bookingInfo = data;
				locals.enquirySubmitted = true;
			}
			next();
		});

	};

	view.render('confirmation');
};

function recordEvent(data){
    var bookingEvent = {
      item: data.tour,
      description: data.tourName,
      precioPagado: data.bookingTotalPrice,
      precioMostrado: data.bookingFlatPrice,
      pagoAMetroPago: data.bookingTransactionFee,
      pagoAOperador: data.bookingOperatorFee,
      ganacia: data.bookingRevenue,
      buyerId: data.user,
      operatorId: data.operator,
      keen: {
        timestamp: new Date().toISOString()
      }
    };

    // Send it to the "purchases" collection
     client.addEvent("bookings", bookingEvent, function(err, res){
      if (err) {
        console.log(err);
        return true;
      }
      else {
         return true;
      }
    });
};

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

         if (travelers >= priceCatalog[i][0] && travelers <= priceCatalog[i][1]){
           var pricePerTraveler = priceCatalog[i][2];
           return pricePerTraveler;
         } else {
           console.log("Not returned");
         }
        } // end for
      } //end func

			function getCost(travelers, locals){
      var priceCatalog = [];
      console.log(locals.data.tour.multiPriceCatalog)
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

         if (travelers >= priceCatalog[i][0] && travelers <= priceCatalog[i][1]){
           var costPerTraveler = priceCatalog[i][3];
					 if (costPerTraveler) {
           	return costPerTraveler;
					 } else {
						 var costPerTraveler =0;
						 return costPerTraveler;
					 }
         } else {
           console.log("Not returned");
         }
        } // end for
      } //end func
