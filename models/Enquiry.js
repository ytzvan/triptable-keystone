var keystone = require('keystone');
var Types = keystone.Field.Types;
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
var bookingEmail = "hello@triptableapp.com";
var bookingEmailName = "Reservas Triptable";


var Enquiry = new keystone.List('Enquiry', {
	nocreate: true
});

Enquiry.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true},
	phone: { type: String },
	hotel: { type: String },
	people : {type: Types.Number},
	tour: { type: Types.Relationship, ref: 'Tour', index: true },
	date: { type: Types.Date },
	bookingStatus: { type: Types.Select, options: [
		{ value: 'pending', label: 'Pending' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'declined', label: 'Declined' }
	], default: 'pending' },
	operatorEmail:{ type: String },
	operatorName: {type: String},
	message: { type: Types.Textarea},
	tourPrice: {type: Types.Money},
	createdAt: { type: Date, default: Date.now },
	friendlyId: {type: String, unique: true},
	datePretty: {type: String}
});

Enquiry.schema.pre('save', function(next) {
	this.wasNew = this.isNew;
	var currentId = "" ;
	currentId = this._id;
	currentId = currentId.toString();
	var str1 = currentId.toString().substring(0,4);
	var largo = currentId.length - 4;
	var str2 = currentId.toString().substring(largo);
	str1 += str2;
	this.friendlyId = str1;
	var date = this.date;
	var datePretty = moment(date).format("dddd, Do MMMM YYYY");
	this.datePretty = datePretty;
	next();
});

Enquiry.schema.post('save', function() {
	if (this.wasNew) {
		this.sendUserEmail(this); //Send User email
		var email = this.operatorEmail 
		this.sendBookingNotificationEmail(this, email); // Send OP email
		this.sendBookingNotificationEmail(this, bookingEmail); // Send OP email
	}
});

Enquiry.schema.methods.sendUserEmail = function (obj) {
	var email = obj.email;
	var name = obj.name.full;

		Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: email,
			toName: name,
			subject: 'Tu reserva de Triptable',
			textMessage: 'Hola ' + name+', Hemos enviado tu solicitud de Reserva al operador del tour. Te notificaremos cuando tu reserva esté confirmada. \nSaludos, El equipo de Triptable ',
			htmlMessage: 'Hola ' + name+', Hemos enviado tu solicitud de Reserva al operador del tour. Te notificaremos cuando tu reserva esté confirmada. \nSaludos, El equipo de Triptable',
			fromEmail: bookingEmail,
			fromName: bookingEmailName,
		}).exec({
		// An unexpected error occurred.
		error: function (err){
		 	console.log("err", err);
		},
		// OK.
		success: function (){
		 console.log("Enviado email de Usuario");
		},
	});
}


Enquiry.schema.methods.sendBookingNotificationEmail = function (obj, email) {
	var booking = obj; 
	var tourId = obj.tour;
	var email = email;
	var name = obj.operatorName;
	var bookerName = obj.name.full;
	console.log("obj date:", obj.date);
	var fecha = moment(obj.date).format("dddd, Do MMMM YYYY");
	console.log(fecha);

	keystone.list('Tour').model.findOne({'tourId': tourId}).exec(function(err, tour) {
		if (err) return callback(err);
		Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: email,
			toName: name,
			subject: 'Tienes una Solictud de Reserva',
			htmlMessage: 'Hola '+name+', <br>' + bookerName + ' ha solicitado reservar el tour: <strong>' + tour.name +'</strong> para el día: ' + fecha + ' para '+ booking.people + ' personas. <br>Por favor responde a este e-mail para confirmar o declinar esta solicitud de reserva. <br><strong>TourId:</strong> '+ tour.tourId +'.<br><strong>Ref:</strong> '+ obj.friendlyId + ' <br>El equipo de Triptable.' ,
			textMessage: bookerName + ' ha solicitado reservar el tour' + tour.name +' para el día' + fecha + ' para '+ booking.people + ' personas. Responde a este e-mail para confirmar o declinar esta solicitud de reserva. \nTourId: '+ tour.tourId +'.ref: '+ obj.friendlyId + ' \nEl equipo de Triptable.' ,
			fromEmail: bookingEmail,
			fromName:  bookingEmailName,
		}).exec({
		// An unexpected error occurred.
		error: function (err){
		 	console.log("err", err);
		},
		// OK.
		success: function (){
		 console.log("Enviado email de Operador");
		},
	});
	});
}
Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, bookingStatus, tour, date';
Enquiry.register();
