var keystone = require('keystone');
var Types = keystone.Field.Types;
var Mailgun = require('machinepack-mailgun');
var SlackUtils = require('../utils').SlackUtils;
/**
 * User Model
 * ==========
 */
var User = new keystone.List('User', {
	defaultSort: '-createdAt', nodelete: true
 });

var storage = new keystone.Storage({
  adapter: require('keystone-storage-adapter-s3'),
  s3: {
    key: 'AKIAJGHX437Z664RXBXA', // required; defaults to process.env.S3_KEY
    secret: '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', // required; defaults to process.env.S3_SECRET
    bucket: 'triptable', // required; defaults to process.env.S3_BUCKET
    /*region: 'ap-southeast-2', // optional; defaults to process.env.S3_REGION, or if that's not specified, us-east-1
    path: '/profilepics', // optional; defaults to "/"
    publicUrl: "https://xxxxxx.cloudfront.net", // optional; sets a custom domain for public urls - see below for details*/
    uploadParams: { // optional; add S3 upload params; see below for details
      ACL: 'public-read',
    },
  },
  /*schema: {
    bucket: true, // optional; store the bucket the file was uploaded to in your db
    etag: true, // optional; store the etag for the resource
    path: true, // optional; store the path of the file in your db
    url: true, // optional; generate & store a public URL
  },*/
});
User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: {unique: true } },
  cellphone: {type: String},
	password: { type: Types.Password, initial: true, required: true, min: 4, rejectCommon: false },
  referalCode : {type: String},
  promoCode: { type: Types.Relationship, ref: 'PromoCode', index: true, many: true},
  credit : {type: Types.Money, default: 0},
	image: {type: Types.CloudinaryImage},
  socialmedia: {
    facebook: {type: String},
    twitter: {type: String},
    instagram: {type: String},
	},
	bank: {
    bankName: {type: String},
    accountNumber: {type: String},
    accountName: {type: String},
    accountType: {type: String},
  },
	toursPurchased: {type: Types.Relationship, ref: "Tour", many: true},
	listings: {type: Types.Relationship, ref: "Tour", refPath: 'owner', many: true},
  description: {type: Types.Textarea },
  createdAt: { type: Date, default: Date.now, noedit: true }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	isVerified: { type: Boolean, label: 'Verified User', index: true, defaults: false },
	isGuide: {type: Boolean, label: 'Is a Tour Provider', index: true},
	companyName: {type: String, dependsOn: { isGuide: true }},
	mainActivity: {type: String, dependsOn: { isGuide: true }},
	countryCode: { type: String },
	country: { type: Types.Relationship,  dependsOn: { isGuide: true }, ref: 'Country' },
	/*contract: { type: Types.S3File, dependsOn: { isGuide: true } }, // contrato
  personalIdentification: { type: Types.S3File, dependsOn: { isGuide: true } }, // copia de identificacion
  operationsFile: { type: Types.S3File, dependsOn: { isGuide: true } }, // Aviso de operaciones*/
	businessLicence : { type: Types.File, storage: storage }
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
User.relationship({ ref: 'Enquiry', path: 'enquiries', refPath: 'operator' });

/**
 * Registration
 */

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
		},
	});
}
User.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

User.schema.post('save', function() {
	if (this.wasNew && this.isGuide) {
		SlackUtils.notifyNewGuide(this);
	}
	return true;
});

User.defaultColumns = 'name, email, isAdmin, isGuide, -createdAt, referalCode';
User.register();
