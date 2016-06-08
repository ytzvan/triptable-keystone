var keystone = require('keystone');
var Types = keystone.Field.Types;
var moment = require('moment');
moment.locale('es', {
    months : "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split("_"),
    monthsShort : "en._feb._mar_abr._mayo_jun_jul._ago_sept._oct._nov._dec.".split("_"),
    weekdays : "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
    weekdaysShort : "dom._lun._mar._mier._jue._vie._sáb.".split("_"),
    weekdaysMin : "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
	});
moment.locale('es');

/**
 * Post Model
 * ==========
 */

var Tour = new keystone.List('Tour', {
	map: { name: 'name' },
	autokey: { path: 'slug', from: 'name', unique: true }
});

Tour.add({
	tourId: { type: String, index: true, noedit: true},
	name: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	owner: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	images: { type: Types.CloudinaryImages },
	description: {
		short: { type: String},
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	keywords: {type: String},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
	minPerson: {type: Types.Number, default: 1 },
	maxPerson: {type: Types.Number, default: 10 },
	departureTime: { type: String},
	arrivalTime: {type: String},
	price: {type: Types.Money},
	duration: {type: Types.Number },
	transportation: {type: Types.Boolean, default: true },
	hotelPickup: {type: Types.Boolean, default: true },
	food: {type: Types.Boolean, default: false },
	featured: {type: Types.Boolean, default: false },
	insurance: {type: Types.Boolean, default: false },
	latitude: {type: String },
	longitude: {type: String },
	country: { type: Types.Relationship, ref: 'Country' },
	province : { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
	city : { type: Types.Relationship, ref: 'City', filters: { province: ':province' } },
	highlights: { type: Types.TextArray},
	startingPoint : {type: String},
	finishPoint: {type: String},
  nOfReviews: {type: Types.TextArray},
	reviews : { type: Types.Relationship, ref: 'Review', many: true },
  attraction: { type: Types.Relationship, ref: 'Attraction', index: true },
  createdAt: { type: Date, default: Date.now, noedit: true },


});

Tour.schema.virtual('content.full').get(function() {
	return this.description.extended || this.description.short;
});
Tour.relationship({ ref: 'Enquiry', path: 'enquiries', refPath: 'tour' });
Tour.relationship({ ref: 'Review', path: 'reviews', refPath: 'tour' });
Tour.defaultColumns = 'name, state|20%, author|20%, publishedDate|20%';
Tour.schema.pre('save', function(next) {
    this.tourId = this.id;
    next();
});
Tour.register();
