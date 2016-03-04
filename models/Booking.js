var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var Booking = new keystone.List('Booking', {
	nocreate: true,
	noedit: true
});

Booking.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
	enquiryType: { type: Types.Select, options: [
		{ value: 'message', label: 'Just leaving a message' },
		{ value: 'question', label: 'I\'ve got a question' },
		{ value: 'other', label: 'Something else...' }
	] },
	message: { type: Types.Markdown, required: true },
	createdAt: { type: Date, default: Date.now }
});

Booking.schema.pre('save', function(next) {
	this.wasNew = this.isNew;
	next();
});

Booking.schema.post('save', function() {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

Booking.schema.methods.sendNotificationEmail = function(callback) {
	
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
				email: 'contact@triptable.com'
			},
			subject: 'New Enquiry for Triptable',
			enquiry: enquiry
		}, callback);
		
	});
	
};

Booking.defaultSort = '-createdAt';
Booking.defaultColumns = 'name, email, enquiryType, createdAt';
Booking.register();
