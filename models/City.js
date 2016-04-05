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
	description:  { type: String },
	image: { type: Types.CloudinaryImage },
	country: { type: Types.Relationship, ref: 'Country' },
	province: { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
});

City.defaultColumns = 'City, description|20%, image|20%, publishedDate|20%';
City.relationship({ ref: 'Tour', path: 'City' });
City.schema.pre('save', function(next) {
    this.cityId = this.id;
    next();
});
City.register();
