var keystone = require('keystone');
var Types = keystone.Field.Types;
var Mailgun = require('machinepack-mailgun');
var CRM = new keystone.List('CRM', {
	nocreate: true,
});

CRM.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
	enquiryType: { type: Types.Select, options: [
		{ value: 'Triptable', label: "Aumentar tus reservas" },
		{ value: 'CRM', label: "Manejar mis tours" },
		{ value: 'Ambas', label: "Ambos" },
	], required: false },
	message: { type: String, required: false },
});

CRM.track = true;
CRM.defaultSort = '-createdAt';
CRM.defaultColumns = 'name, email, enquiryType, createdAt';
CRM.schema.post('save', function() {
	this.sendCRMEmail(this); // Send OP emai
});

CRM.schema.methods.sendCRMEmail = function (obj) {
	var lead = obj; 
	var name = obj.name.full;
	var texto = "Hola " + name + ". <br> Triptable es una plataforma web y móvil que le permite a viajeros reservar tours y actividades online y ayuda a los proveedores de turismo a aumentar sus reservas y ventas en línea. <br> Cómo hablamos en Expoturismo, pienso que podemos colaborar publicando sus servicios en nuestra plataforma para que puedan ser reservados en línea. <br> De estar interesados, el siguiente paso sería que nos envíen información de sus tours y actividades para añadirlos a la plataforma. <br> Nuestro sitio web es: http://triptableapp.com donde pueden conocer toda la información acerca de nosotros. <br> Personalmente estaré respondiendo a todas sus preguntas o dudas. <br>Saludos, <br>Ytzvan Mastino<br>Co-founder & CEO"

	Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: obj.email,
			toName: name,
			subject: 'Información acerca de Triptable',
			htmlMessage: texto,
			textMessage: texto,
			fromEmail: 'hello@triptableapp.com',
			fromName:  'Triptable - Reserva de tours',
		}).exec({
		// An unexpected error occurred.
		error: function (err){
		 	console.log("err", err);
		},
		// OK.
		success: function (){
		 console.log("Enviado email");
		},
	});
}
CRM.register();