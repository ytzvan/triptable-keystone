var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Province Model
 * ==========
 */
var Province = new keystone.List('Province', {
	map: { name: 'province' },
	autokey: { path: 'slug', from: 'province', unique: true }
});

Province.add({
	provinceId: { type: String, index: true, noedit: true},
	province: { type: String },
	description:  { type: String },
	image: { type: Types.CloudinaryImage },
	country: { type: Types.Relationship, ref: 'Country' },
	featured: {type: Types.Boolean, default: false }
});

Province.relationship({ ref: 'Tour', path: 'province' });
Province.relationship({ ref: 'City', path: 'province' });
Province.relationship({ ref: 'Attraction', path: 'province' });
Province.defaultColumns = 'Province, description|20%, image|20%, publishedDate|20%';
Province.schema.pre('save', function(next) {
    this.provinceId = this.id;
    next();
});
Province.register();
