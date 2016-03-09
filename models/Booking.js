var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var Booking = new keystone.List('Booking', {
});

Booking.add({
	bookingID: { type: String, noedit: true },
	email: { type: String },
	tour: { type: String },
	price: {type: Number},
	date: { type: Date, default: Date.now },
	people: { type: Number},
	isConfirmed : {type: Boolean, default: false},
	isPay : {type: Boolean, default: false},

});

Booking.schema.pre('save', function(next) {
	this.wasNew = this.isNew;
	this.bookingID = this.id;
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
	
	var booking = this;
	
//	keystone.list('User').model.find().where('isAdmin', true).exec(function(err, admins) {
		
		if (err) return callback(console.log(err));
		console.log("ready to send mail");
		new keystone.Email('booking-notification').send({
			to: 'mastino14@gmail.com',
			from: {
				name: 'Triptable',
				email: 'y@triptableapp.com'
			},
			subject: 'New Enquiry for Triptable',
			enquiry: booking
		}, callback);
		
//	});
	
};

Booking.defaultSort = '-createdAt';
Booking.defaultColumns = 'name, email, enquiryType, createdAt';
Booking.register();
