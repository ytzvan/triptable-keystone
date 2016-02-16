var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Location Model
 * ==========
 */
var Location = new keystone.List('Location', {
	map: { name: 'city' },
	autokey: { path: 'slug', from: 'city', unique: true }
});

Location.add({
	locationId: { type: String, index: true, noedit: true},
	country: { type: String },
	state: { type: String },
	city: { type: String, required: true},
	image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
});

Location.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});
Location.relationship({ ref: 'Tour', path: 'tour', refPath: 'location' });
Location.defaultColumns = 'country, state|20%, city|20%, publishedDate|20%';
Location.schema.pre('save', function(next) {
    this.locationId = this.id;
    next();
});
Location.register();
