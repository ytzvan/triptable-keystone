var keystone = require('keystone');
var Types = keystone.Field.Types;
var Mailgun = require('machinepack-mailgun');

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: {unique: true } },
	password: { type: Types.Password, initial: true, required: true },
	image: {type: Types.CloudinaryImage},
  socialmedia: {
    facebook: {type: Types.Url},
    twitter: {type: Types.Url},
    instagram: {type: Types.Url},
  },
  description: {type: Types.Textarea },
  createdAt: { type: Date, default: Date.now, noedit: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	isGuide: {type: Boolean, label: 'Is a Tour Provider', index: true}
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});

/**
 * Relationships
 */

User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });
User.relationship({ ref: 'Review', path: 'reviews', refPath: 'author' });
User.relationship({ ref: 'Tour', path: 'tours', refPath: 'owner' });
User.relationship({ ref: 'Enquiry', path: 'enquiries', refPath: 'operator' })


/**
 * Registration
 */
 User.schema.post('save', function() {
     console.log(this);
	//	this.notificationEmail(this); // Send notificationEmail
});
 User.schema.methods.notificationEmail = function (obj) {
	var email = obj.email;
	var name = obj.name.full;

		Mailgun.sendHtmlEmail({
			apiKey: process.env.MAILGUN_APIKEY,
			domain: process.env.MAILGUN_DOMAIN,
			toEmail: "hello@triptable.com",
			toName: "Triptable",
			subject: 'Nuevo Usuario Registrado',
			textMessage: 'Hola, un nuevo usuario se ha registrado en triptable. <br> Nombre: ' + name + '<br>email: '+ email,
			htmlMessage: 'Hola, un nuevo usuario se ha registrado en triptable. <br> Nombre: '+ name +'<br>email: '+ email,
			fromEmail: process.env.DEFAULT_EMAIL,
			fromName: "Triptable",
		}).exec({
		// An unexpected error occurred.
		error: function (err){
		 	console.log("err", err);
		},
		// OK.
		success: function (){
		 console.log("Enviada Notificacion");
		},
	});
}


User.defaultColumns = 'name, email, isAdmin';
User.register();
