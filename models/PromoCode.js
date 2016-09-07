var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * PostCategory Model
 * ==================
 */

var PromoCode = new keystone.List('PromoCode', {
	//autokey: { from: 'name', path: 'key', unique: true }
	autokey: { path: 'slug', from: 'name', unique: true }
});

PromoCode.add({
	name: { type: String, required: true },
  amount: { type: Types.Money },
	description: {type: String},
  users: { type: Types.Relationship, ref: 'User', index: true, many: true},
    createdAt: { type: Date, default: Date.now, noedit: true },
});

PromoCode.relationship({ ref: 'Enquiry', path: 'promocode', refPath: 'name' });

PromoCode.defaultColumns = 'name|15%, amount|15%, createdAt|20%, users|20%';

PromoCode.register();