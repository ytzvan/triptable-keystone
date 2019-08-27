var keystone = require('keystone');
var Types = keystone.Field.Types;
/**
 * Collection Model
 * ==========
 */
var Collection = new keystone.List('Collection', {
	autokey: { path: 'slug', from: 'name', unique: true, index: true },
	track: true
});

Collection.add({
	name: { type: String, required: true, initial: true },
	title: {
		en: { type: String, label: 'Inglés'},
		es: { type: String, label: 'Español' }
	},
	description: {
		en: { type: Types.Html, wysiwyg: true, height: 400, label: 'Inglés' },
		es: { type: Types.Html, wysiwyg: true, height: 400, label: 'Español' }
	},
	state: {
		type: Types.Select,
		options: "draft, published, archived, child",
		default: "draft",
		index: true
	},
	image: { type: Types.CloudinaryImage },
	icon: { type: String },
	featured: {type: Types.Boolean, default: false },
    country: { type: Types.Relationship, ref: 'Country' },
	province : { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
	city : { type: Types.Relationship, ref: 'City', filters: { province: ':province'} },
	tours: {
		type: Types.Relationship, ref: 'Tour', many: true,
		filters: { state: 'published' }} 
});
Collection.relationship({ ref: 'Tour', path: 'tours', refPath: 'tours' });
Collection.defaultColumns = 'name, title.es, title.en, city, state';
Collection.register();
