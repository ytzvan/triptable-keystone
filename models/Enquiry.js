var keystone = require('keystone');
var Types = keystone.Field.Types;
var Utils = require('../utils').GeneralUtils;
var SlackUtils = require('../utils').SlackUtils;
var Email = require('../utils').Email;
var moment = require('moment');
moment.locale('es', {
    months : "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split("_"),
    monthsShort : "en._feb._mar_abr._mayo_jun_jul._ago_sept._oct._nov._dec.".split("_"),
    weekdays : "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
    weekdaysShort : "dom._lun._mar._mier._jue._vie._sáb.".split("_"),
    weekdaysMin : "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
	});
moment.locale('es');

/**
 * Enquiry Model
 * =============
 */
var Mailgun = require('machinepack-mailgun');
var bookingEmail = process.env.DEFAULT_EMAIL;
var bookingEmailName = "Reservas Triptable";


var Enquiry = new keystone.List('Enquiry', {
	nocreate: true
});

Enquiry.add({
	name: { type: Types.Name, required: true, default: "Customer 1" },
	email: { type: Types.Email, required: true, default: "hello@triptable.com" },
	phone: { type: String },
	hotel: { type: String },
	people: { type: Types.Number },
	nOfAdults: { type: Types.Number },
	nOfChildren: { type: Types.Number },
	nOfInfants: { type: Types.Number },
	//place: { country: { type: String }},
	place: {
		country: { type: Types.Relationship, ref: "Country" },
		province: { type: Types.Relationship, ref: "Province" },
		city: { type: Types.Relationship, ref: "City" }
	},
	tour: { type: Types.Relationship, ref: "Tour", index: true },
	tourName: { type: String },
	tourUrl: { type: String },
	date: { type: Types.Date, utc: true },
	datePretty: { type: String },
	bookingTime: { type: String },
	promocode: { type: Types.Relationship, ref: "PromoCode", many: true },
	bookingStatus: {
		type: Types.Select,
		options: [
			{ value: "0", label: "Pendiente" },
			{ value: "1", label: "Confirmada" },
			{ value: "2", label: "Declinada" }
		],
		default: "0"
	},
	operatorEmail: { type: String },
	operatorName: { type: String },
	operatorCellphone: { type: String },
	operator: {
		type: Types.Relationship,
		ref: "User",
		index: true,
		filters: { isGuide: true }
	},
	message: { type: Types.Textarea },
	tourPrice: { type: Types.Money },
	adultTotalPrice: { type: Types.Money },
	childPrice: { type: Types.Money },
	childTotalPrice: { type: Types.Money },
	infantPrice: { type: Types.Money },
	infantTotalPrice: { type: Types.Money },
	createdAt: { type: Date, default: Date.now, noedit: true },
	updatedAt: { type: Date, noedit: true },
	friendlyId: { type: String, unique: true, noedit: true },
	bookingTotalPrice: { type: Types.Money, noedit: true }, //precio total
	bookingFlatPrice: { type: Types.Money, noedit: true }, //precio sin costo de metro pago
	bookingTransactionFee: { type: Types.Money, noedit: true }, // cantidad a pagar a metro pago
	bookingOperatorFee: { type: Types.Money, noedit: true }, // cantidad a pagar a operador
	bookingRevenue: { type: Types.Money, noedit: true }, // cantidad que nos toca
	bookingComission: { type: Types.Number, noedit: true }, // % de comision establecida
	transactionResponseCode: { type: String, noedit: true },
	transactionReference: { type: String, noedit: true },
	transactionAuthorizationNumber: { type: String, noedit: true },
	transactionTime: { type: String, noedit: true },
	transactionDate: { type: String, noedit: true },
	transactionBallot: { type: String, noedit: true },
	cardholder: { type: String, noedit: true },
	user: { type: Types.Relationship, ref: "User", index: true },
	isPay: { type: Types.Boolean },
	dateOfPayment: { type: Types.Date, dependsOn: { isPay: true } },
	paymentConfirmationNumber: { type: String, dependsOn: { isPay: true } }
});

Enquiry.schema.pre('save', function(next) {
	this.prettyDate(this);
	this.wasNew = this.isNew;
	var currentId = "" ;
	currentId = this._id;
	currentId = currentId.toString();
	var str1 = currentId.toString().substring(0,4);
	var largo = currentId.length - 4;
	var str2 = currentId.toString().substring(largo);
	str1 += str2;
	this.friendlyId = str1;
	/*if (this.preStatus == 0 && this.bookingStatus == 1) {
		console.log("Enviar email de reserva confirmada");
	} */
	let today = new moment();
	let enquiryDate = new moment(this.date);
	let sendEmail = moment(today).isBefore(enquiryDate); 

	if (this.bookingStatus == 1 && sendEmail) {
		try {
		Email.sendConfirmationEmailToUser(this);
		} catch (e) {
		}
	}
	if (!this.place.country && this.tour) {
		let place;
		let tourId;
		tourId = this.tour;
		enquiryId = this._id;
		place = getCountryfromTour(this.tour).then(function (placeData) {
			updateEnquiryModel(enquiryId, placeData);
		});
	}
	next();
});

function updateEnquiryModel(enquiryId, placeData) {
	keystone
		.list("Enquiry")
		.model.findByIdAndUpdate(enquiryId, {
			$set: { "place": placeData }
		})
		.exec(function(err, result) {
			if (!err) {
				return result;
			} else {
				return false;
			}
		});
}
function getCountryfromTour(tourId){
	return new Promise((resolve, reject) => {
		 keystone
			.list("Tour")
			.model.findById(tourId)
			.exec(function (err, tour) {
				if (!err) {
					let place = {};
					place.country = tour.country;
					place.province = tour.province;
					place.city = tour.city;
					
					resolve(place);
				} else {
					reject("not found");
				}
			});
	});

}
Enquiry.schema.post('init', function(next){
		var status = this.bookingStatus;
		this.preStatus = this.bookingStatus;
});
Enquiry.schema.post('save', function() {
	if (this.wasNew) {
		this.prettyDate(this);
		var email = this.operatorEmail;
		Email.newBookingRequestOperator(this); //Send Operator email
		Email.newBookingRequestUser(this); //Send User email
	//	this.sendUserEmail(this); 
	//	this.sendBookingNotificationEmail(this, email); //Email al operadors
	//s	this.sendBookingNotificationEmail(this, bookingEmail); // Copia a hello@triptable.com
		/*
		var messagebird = require('messagebird')('d0CiSToNU18haOdnsJCLy3uoe');

		var params = {
		  'originator': 'Triptable',
		  'recipients': [
		    '+50768080024'
		  ],
		  'body': 'Reseva compuserNewBookingRequestada. Descarga aquí tu e-ticket y preséntalo en la entrada.'
		};

	messagebird.messages.create(params, function (err, data) {
		  if (err) {
		    return console.log(err);
		  }
		  console.log(data); 
		});*/
		
		SlackUtils.sendEnquiryToSlack(this);
	}

	if (this.bookingStatus == 1){
		//Utils.sendReviewEmail(this);
	}



	try {
	//Add tour to purchase from user: 
	var tourToSave = this.tour;
	var user = this.user;
	var string = tourToSave.toString();
	keystone.list('User').model.findByIdAndUpdate({"_id": user},{ $push: { 'toursPurchased': tourToSave} }, { 'new': true})
		.exec(function(err,result){
			return true;
	});
	} catch (err) {
		return true;
	}
	
});

Enquiry.schema.methods.sendReviewEmail = function (enquiry) {  
		/* Cron test */
		var schedule = require('node-schedule');
		var date =  moment(enquiry.date);
		var new_date = moment(date, "DD-MM-YYYY").add(2, 'days');
		var year = new_date.year();
		var month = new_date.month();
		var day = new_date.date();
		var hour = 9;
		var minute = 00;
		var dateToSend = new Date(year, month, day, hour, minute, 0);
		//var test = new Date(2016, 11, 28, 16, 42, 0);
		try {
			var j = schedule.scheduleJob(dateToSend, function(){	
				//Send email logic
				Email.askForFeedbackEmail(enquiry);
			});  
		} catch (err) {
			
		}

		/*End cron test */
}

Enquiry.schema.methods.prettyDate = function (obj) {
  	var date = obj.date;
	var datePretty = moment(date).format("dddd, Do MMMM YYYY");
	this.datePretty = datePretty;
}

Enquiry.schema.methods.sendUserEmail = function (obj) {
	var email = obj.email;
	var name = obj.name.full;
  var friendlyId = obj.friendlyId;
		Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: email,
			toName: name,
			subject: 'Tu reserva de Triptable',
			textMessage: 'Hola ' + name + ', Hemos enviado tu solicitud de Reserva al operador del tour. <br> Tu ID de reserva es el ' + friendlyId + '. <br>Los datos de tu reservas son los siguientes: <br>Tour: ' + obj.tourName + '. <br>Fecha de reserva: ' + obj.datePretty + '. <br>Cantidad de Adultos: ' + obj.nOfAdults + '. <br>Cantidad de Niños: ' + obj.nOfChildren + '. <br>Cantidad de Infantes: ' + obj.nOfInfants + '. <br>Total de Viajeros: ' + obj.people + '. <br> Precio total: '+obj.bookingTotalPrice + '.<br> Puedes el estado de tu reserva en: http://triptable.com/user. <br>Te notificaremos cuando tu reserva esté confirmada. <br> El equipo de Triptable ',
			htmlMessage: 'Hola ' + name + ', Hemos enviado tu solicitud de Reserva al operador del tour. <br> Tu ID de reserva es el ' + friendlyId + '. <br>Los datos de tu reservas son los siguientes: <br>Tour: ' + obj.tourName + '. <br>Fecha de reserva: ' + obj.datePretty + '. <br>Cantidad de Adultos: ' + obj.nOfAdults + '. <br>Cantidad de Niños: ' + obj.nOfChildren + '. <br>Cantidad de Infantes: ' + obj.nOfInfants + '. <br> Precio total: ' + obj.bookingTotalPrice + '.<br> Puedes el estado de tu reserva en: http://triptable.com/user. <br>Te notificaremos cuando tu reserva esté confirmada. <br> El equipo de Triptable ',
			fromEmail: bookingEmail,
			fromName: bookingEmailName,
		}).exec({
		// An unexpected error occurred.
		error: function (err){
		},
		// OK.
		success: function (){
		},
	});
}

Enquiry.defaultSort = '-date';
Enquiry.defaultColumns =
	"name|20%, bookingStatus|15%, people|10%, date|15%, bookingTotalPrice|15%, friendlyId|15%, isPay";
Enquiry.register();
