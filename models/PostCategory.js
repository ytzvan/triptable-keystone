var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * PostCategory Model
 * ==================
 */

var PostCategory = new keystone.List('PostCategory', {
	//autokey: { from: 'name', path: 'key', unique: true }
	autokey: { path: 'slug', from: 'name', unique: true }
});

PostCategory.add({
	name: { type: String, required: true },
  	image: { type: Types.CloudinaryImage },
	featured: {type: Types.Boolean, default: false },
	icon : {type: String, default: "fa-bus"}
});

PostCategory.relationship({ ref: 'Tour', path: 'categories', refPath: 'name' });

PostCategory.register();
