var keystone = require('keystone');
var Types = keystone.Field.Types;
/**
 * Collection Model
 * ==========
 */
var Collection = new keystone.List('Collection', {
	autokey: { path: 'slug', from: 'name', unique: true }
});

Collection.add({
	name: { type: String, required: true, initial: true },
	description:  { type: String },
	image: { type: Types.CloudinaryImage },
	featured: {type: Types.Boolean, default: false },
    country: { type: Types.Relationship, ref: 'Country' },
	province : { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
	city : { type: Types.Relationship, ref: 'City', filters: { province: ':province' } },
    
});
Collection.relationship({ ref: 'Tour', path: 'tours', refPath: 'collections' });
Collection.register();
