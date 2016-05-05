var keystone = require('keystone');
var Types = keystone.Field.Types;
/**
 * Reviews Model
 * ==================
 */

var Review = new keystone.List('Review', {
	//autokey: { from: 'name', path: 'key', unique: true }
	autokey: { path: 'slug', from: 'author', unique: true }
});

Review.add({
	message: { type: Types.Textarea },
	author: { type: Types.Relationship, ref: 'User', index: true },
	score: {type: Types.Number},
	tour: { type: Types.Relationship, ref: 'Tour', index: true },
});

//Reviews.relationship({ ref: 'Postspath: 'categories', refPath: 'messa' });
Review.defaultColumns = 'author, score|20%, message|20%, tour|20%';
Review.register();
