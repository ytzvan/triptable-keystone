/* Este controlador maneja el POST del booking */
var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');
var request = require('request');
var extend = require('extend');
var Keen = require('keen-js');
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
	    var body = req.body;
		  var result;
		  var response;

      console.log(req.body.people);
        var invalidTravelers = isNaN(req.body.people);
         if (invalidTravelers){
		  	 var errorMessage = "Número de Viajeros inválido";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		//Here goes the payment logic
	    var tourPrice = locals.data.tour.price;
	    var travelers = req.body.people;
	    var flatPrice = tourPrice * travelers; // precio individual del tour * cantidad de viajeros
	    var processorTax = 3.9; // % del procesador
	    var processorFee = 0.30; // fee individual por transaccion
	    var commisionPercentaje = 15; //porcentaje de commision que nos llevamos nosotros
	    var commision = flatPrice * commisionPercentaje / 100; //Nuestro revenue por el tour vendido
	    var tourOperatorCost = flatPrice - commision;

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
	    	bookingRevenue : commision
	    };

//		var finalObj = {};
		extend(updateBody, req.body);
      var cardNumber = body.cardNumber;
      cardNumber = cardNumber.replace(/ /g,'');
      var cardDate = body.expiration;
      cardDate = cardDate.replace(' / ', '');
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
    console.log(options);
		request(options, function (error, response, body) {
		  if (error) throw new Error(error);

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
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 110){
		  	var errorMessage = "Tipo de tarjeta inválida, por favor ingrese una tarjeta VISA o MASTERCARD";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 999){
		  	var errorMessage = "Error de sistema, no hemos cobrado nada a su cuenta, por favor intente de nuevo";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 117){
		  	var errorMessage = "Tarjeta expirada, por favor introduzca una tarjeta válida";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status == 105){
		  	var errorMessage = "El CVV es necesario";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  }
		  if (status != 00) {
		  	var errorMessage = "Hubo un problema al procesar su transacción, por favor intente nuevamente";
		  	req.flash('error', errorMessage);
		   // return res.status(500).render('errors/404');
		    return res.redirect(req.get('referer'));
		  } else {

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
			fields: 'name, email, phone, people, date, bookingStatus, tour, tourName, tourUrl, message, hotel, operatorEmail, operatorName, operator, tourPrice, user, bookingTotalPrice, bookingFlatPrice, bookingTransactionFee, bookingOperatorFee, bookingRevenue, transactionResponseCode, transactionReference, transactionAuthorizationNumber, transactionTime, transactionDate, transactionBallot',
			errorMessage: 'There was a problem submitting your booking:'
		}, function(err, data) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.bookingInfo = data;
				locals.enquirySubmitted = true;
        recordEvent(data);
			}
			next();
		});

	};

	view.render('bookingConfirmation');
};

function recordEvent(data){
  console.log(data);
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
        console.log(res);
         return true;
      }
    });
};