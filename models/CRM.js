var keystone = require('keystone');
var Types = keystone.Field.Types;
var Mailgun = require('machinepack-mailgun');
var CRM = new keystone.List('CRM', {
	nocreate: true,
});

CRM.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
  company: { type: String, },
	country: { type: String },
	website: { type: String },
	facebook: { type: String, required: false },
	mainActivity: { type: String, required: false },

  createdAt: { type: Date, default: Date.now, noedit: true },
});

CRM.track = true;
CRM.defaultSort = '-createdAt';
CRM.defaultColumns = 'name, email, company, phone, status';
CRM.register();