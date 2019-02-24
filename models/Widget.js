let keystone = require('keystone');
let Types = keystone.Field.Types;


const widget = new keystone.List('Widget');


let fields = {};

fields.name = { type: String, required: true  };
fields.user = { type: Types.Relationship, ref: 'User'};
fields.referalUrl = { type: String };
fields.resultLimit = { type: Types.Number };
fields.destination =  { type: Types.Relationship, ref: 'City'};

widget.add(fields);
widget.defaultColumns = 'referal';
widget.register();