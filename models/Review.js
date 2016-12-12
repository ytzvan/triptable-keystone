var keystone = require('keystone');
var Types = keystone.Field.Types;
var Tour = require('./Tour');
var tour = keystone.list('Tour');
/**
 * Reviews Model
 * ==================
 */
var t = keystone.list('Tour').model.find()
    //.limit('3')
			t.exec(function(err, results) {
        return true;
			});
var Review = new keystone.List('Review', {
	//autokey: { from: 'name', path: 'key', unique: true }
	autokey: { path: 'slug', from: 'author', unique: true }
});

Review.add({
	message: { type: Types.Textarea },
	author: { type: Types.Relationship, ref: 'User', index: true },
	score: {type: Types.Number},
	tour: { type: Types.Relationship, ref: 'Tour', index: true },
	createdAt: { type: Date, default: Date.now, noedit: true },
});

Review.relationship({ ref: 'Tour', path: 'reviews' });
Review.defaultColumns = 'author, score|20%, message|20%';
Review.register();
