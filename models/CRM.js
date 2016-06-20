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
		{ value: 'Tour Operador', label: "Tour Operador" },
		{ value: 'Guia', label: "Guía Independiente" },
		{ value: 'Agencia de Viajes', label: "Agencia de Viajes" },
		{ value: 'Hotel', label: "Hotel" },
		{ value: 'Transporte', label: "Servicios de Transporte" },
		{ value: 'Insider', label: "Quiero enseñarle mi ciudad a viajeros" },
	], required: false },
	message: { type: String, required: false },
  status: { type: Types.Select, options: [
		{ value: '0', label: "Lead" },
		{ value: '1', label: "Reunión confirmada" },
		{ value: '2', label: "Cerrado" },
		{ value: '3', label: "No Interesado" }
	], required: false, default: 0 },
});

CRM.track = true;
CRM.defaultSort = '-createdAt';
CRM.defaultColumns = 'name, email, enquiryType, createdAt, status';
CRM.schema.pre('save', function(next) {
  console.log(this);
  if (this.firstTime){
	  this.sendCRMEmail(this); // Send OP emai
    //this.firstTime = false;
   }
  next();
});
CRM.schema.post('save', function() {
   console.log("exist post save ", this.firstTime);
});

CRM.schema.methods.sendCRMEmail = function (obj) {
	var lead = obj;
	var name = obj.name.full;
	var texto = "Hola " + name + ". <br> Triptable es una plataforma web y móvil que le permite a viajeros reservar tours y actividades online y ayuda a los proveedores de turismo a aumentar sus reservas y ventas en línea. <br> Actualmente trabajamos con los mejores proveedores de turismo de Latinoamérica para ofrecerle a nuestros usuarios la mejor experiencia posible.<br> Publicar en Triptable es gratis, sin embargo requerimos verificar unos datos primero. El primer paso para convertirte en proveedor es crear una cuenta en: http://triptableapp.com/signup. <br> Pronto te estaré contactando para que me cuentes más acerca de tu negocio y mostrarte como puedes hacerlo crecer con Triptable. <br>Saludos, <br>Ytzvan Mastino<br>Co-founder & CEO"

	Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: obj.email,
			toName: name,
			subject: 'Información acerca de Triptable',
			htmlMessage: texto,
			textMessage: texto,
			fromEmail: process.env.DEFAULT_EMAIL,
			fromName:  'Triptable, LLC',
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