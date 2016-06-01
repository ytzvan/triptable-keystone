var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	username: { type: String, required: true, initial: false, index: true },
	email: { type: Types.Email, initial: true, required: true, index: {unique: true } },
	password: { type: Types.Password, initial: true, required: true },
	image: {type: Types.CloudinaryImage},
  socialmedia: {
    facebook: {type: Types.Url},
    twitter: {type: Types.Url},
    instagram: {type: Types.Url},
  },
  description: {type: Types.Textarea },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	isGuide: {type: Boolean, label: 'Is a Tour Provider', index: true},

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


/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
