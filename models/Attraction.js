var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var Attraction = new keystone.List('Attraction', {
	map: { name: 'name' },
	autokey: { path: 'slug', from: 'name', unique: true }
});
Attraction.add({
	name: { type: String, required: true, index: true },
  description : {type: String},
  country: { type: Types.Relationship, ref: 'Country' },
	province : { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
	city : { type: Types.Relationship, ref: 'City', filters: { province: ':province' } },
  image: { type: Types.CloudinaryImage },
	featured: {type: Types.Boolean, default: false },

  });

Attraction.relationship({ ref: 'Tour', path: 'tours', refPath: 'attraction' });

Attraction.defaultColumns = 'name, description, featured';
Attraction.register();