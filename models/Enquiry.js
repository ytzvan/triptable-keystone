var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */
var Mailgun = require('machinepack-mailgun');
var Enquiry = new keystone.List('Enquiry', {
	nocreate: true
});

Enquiry.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true, displayGravatar: true },
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
	message: { type: Types.Textarea},
	tourPrice: {type: Types.Money},
	createdAt: { type: Date, default: Date.now }
});

Enquiry.schema.pre('save', function(next) {
	this.wasNew = this.isNew;
	next();
});

Enquiry.schema.post('save', function() {
	if (this.wasNew) {
		//this.sendUserEmail(this); //Send User email
		//this.sendOperatorEmail(this); // Send OP email
	}
});

Enquiry.schema.methods.sendNotificationEmail = function(callback) {
	
	if ('function' !== typeof callback) {
		callback = function() {};
	}
	
	var enquiry = this;
	
	keystone.list('User').model.find().where('isAdmin', true).exec(function(err, admins) {
		
		if (err) return callback(err);
		new keystone.Email('enquiry-notification').send({
			to: admins,
			from: {
				name: 'Triptable',
				email: 'y@triptableapp.com'
			},
			subject: 'New Enquiry for Triptable',
			enquiry: enquiry
		}, callback);
		
	});
	
};

Enquiry.schema.methods.sendUserEmail = function (obj) {
	console.log(obj);
	var email = obj.email;
	var name = obj.name.first;
		Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: email,
			toName: name,
			subject: 'Tu reserva de Triptable',
			textMessage: 'Hola ' + name+', Gracias por preferir Triptable. Tu reserva está en proceso de confirmación. Te notificaremos cuando esté confirmada. \nSaludos, El equipo de Triptable ',
			htmlMessage: name+', Gracias por preferir Triptable. Tu reserva está en proceso de confirmación. Te notificaremos cuando esté confirmada. \nSaludos, El equipo de Triptable ',
			fromEmail: 'hello@triptableapp.com',
			fromName: 'Triptable Bookings',
		}).exec({
		// An unexpected error occurred.
		error: function (err){
		 	console.log("err", err);
		},
		// OK.
		success: function (){
		 console.log("sucess");
		},
	});
}
Enquiry.schema.methods.sendOperatorEmail = function (obj) {
	var email = obj.operatorEmail;
	var name = "Ytzvan Mastino";
	console.log("sending OP Email");
		Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: email,
			toName: name,
			subject: 'Solicitud de Reserva de Triptable',
			textMessage: 'Hola ' + name+', Alguien ha solicitado reservar tu tour. Tu reserva está en proceso de confirmación. Te notificaremos cuando esté confirmada. \nSaludos, El equipo de Triptable ',
			htmlMessage: name+', Gracias por preferir Triptable. Tu reserva está en proceso de confirmación. Te notificaremos cuando esté confirmada. \nSaludos, El equipo de Triptable ',
			fromEmail: 'hello@triptableapp.com',
			fromName: 'Triptable Bookings',
		}).exec({
		// An unexpected error occurred.
		error: function (err){
		 	console.log("err", err);
		},
		// OK.
		success: function (){
		 console.log("sucess");
		},
	});
}
Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, bookingStatus, tour, date';
Enquiry.register();
