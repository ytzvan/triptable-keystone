var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Province Model
 * ==========
 */
var City = new keystone.List('City', {
	map: { name: 'city' },
	autokey: { path: 'slug', from: 'city', unique: true }
});

City.add({
	cityId: { type: String, index: true, noedit: true},
	city: { type: String },
	seoES: {
		title: {type: String},
		description: {type: String}
	},
	seoEN: {
		title: { type: String },
		description: { type: String }
	},
	description: {type:String },
	pageContent: {
		es: { type: Types.Html, wysiwyg: true },
		en: { type: Types.Html, wysiwyg: true }	},
	image: { type: Types.CloudinaryImage },
	country: { type: Types.Relationship, ref: 'Country' },
	province: { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
	featured: {type: Types.Boolean, default: false },
	latitude: {type: String},
	longitude: {type: String},
	collections: {type: Types.Relationship, ref: 'Collection', many: true, filters: {city: ':cityId'}},
	tours: {type: Types.Relationship, ref: 'Tour', many: true, filters: {city: ':cityId'}}
});

City.defaultColumns = 'City, description|20%, image|20%, publishedDate|20%';
City.relationship({ ref: 'Tour', path: 'City' });
City.relationship({ ref: 'Collection', path: 'City' });
City.relationship({ ref: 'Attraction', path: 'City' });
City.schema.pre('save', function(next) {
    this.cityId = this.id;
    next();
});
City.register();
