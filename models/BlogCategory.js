var keystone = require('keystone');

/**
 * BlogCategory Model
 * ==================
 */

var BlogCategory = new keystone.List('BlogCategory', {
	//autokey: { from: 'name', path: 'key', unique: true }
	autokey: { path: 'slug', from: 'name', unique: true }
});

BlogCategory.add({
	name: { type: String, required: true }
});

BlogCategory.relationship({ ref: 'Post', path: 'categories', refPath: 'name' });

BlogCategory.register();
