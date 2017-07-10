var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Country Model
 * ==========
 */
var Country = new keystone.List('Country', {
	map: { name: 'country' },
	autokey: { path: 'slug', from: 'country', unique: true }
});

Country.add({
	countryId: { type: String, index: true, noedit: true},
	country: { type: String },
	description:  { type: String },
	image: { type: Types.CloudinaryImage },
	featured: {type: Types.Boolean, default: false },
});

Country.relationship({ ref: 'Tour', path: 'tours', refPath: 'country' });
Country.relationship({ ref: 'Collection', path: 'collections', refPath: 'country' });
Country.relationship({ ref: 'Province', path: 'provinces', refPath: 'country' });
Country.relationship({ ref: 'City', path: 'cities', refPath: 'country' });
Country.relationship({ ref: 'Attraction', path: 'country' });
Country.defaultColumns = 'country, description|20%, image|20%, publishedDate|20%';
Country.schema.pre('save', function(next) {
    this.countryId = this.id;
    next();
});
Country.register();
