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
	name_eng: { type: String},
	state: { type: Types.Select, options: 'draft, published, archived, child', default: 'draft', index: true },
	owner: { type: Types.Relationship, ref: 'User', index: true, filters: { isGuide: true }},
	publishedDate: { type: Types.Date, index: true },
	isParent: {type: Types.Boolean, default: false},
	childs:  { type: Types.Relationship, ref: 'Tour', many: true, filters: { owner: ':owner' }, dependsOn:  {isParent: true} },
  heroImage: { type: Types.CloudinaryImage },
	images: { type: Types.CloudinaryImages },
	duration: {type: Types.Number, required: true, default: 2},
	isMultiDay: {label: '¿Es un tour de varios dias?', type: Types.Boolean, default: false, note : 'Esto le indica a la plataforma si muestra la duración en Horas o Minutos '},
	description: {
		short: { type: String},
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
  description_eng: {
		short: { type: String},
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	videoId : {type: String}, //Created if added a Video URL
	keywords: {type: String},
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
	collections: { type: Types.Relationship, ref: 'Collection', many: true },
	minPerson: {type: Types.Number, default: 1 },
	maxPerson: {type: Types.Number, default: 10 },
	departureTime: { type: String},
	arrivalTime: {type: String},
	price: {type: Types.Money},
	childPrice: {type: Types.Money, default: 0},
	infantPrice: {type: Types.Money, default: 0},
	cost: {type:Types.Money},
  comission: {type: Types.Number, default: 15},
	transportation: {type: Types.Boolean, default: true },
	hotelPickup: {type: Types.Boolean, default: true },
	maritimeTransportation: {type: Types.Boolean, default: false },
	food: {type: Types.Boolean, default: false },
	snacks: {type: Types.Boolean, default: false },
	drinks: {type: Types.Boolean, default: false },
	featured: {type: Types.Boolean, default: false },
	insurance: {type: Types.Boolean, default: false },
	tourGuide: {type: Types.Boolean, default: true },
	privateCabin: {type: Types.Boolean, default: false },
	sharedCabin: {type: Types.Boolean, default: false },
	triptableCertified: {type: Types.Boolean, default: false },
	instantConfirmation: {type: Types.Boolean, default: false },
  hasTaxes : {type : Types.Boolean, default: false},
	taxes: {type: Types.Boolean, default: false,  dependsOn: { hasTaxes: true } },
  hasTickets : {type : Types.Boolean, default: false},
	tickets: {type: Types.Boolean, default: false, dependsOn: { hasTickets: true } },
	latitude: {type: String },
	longitude: {type: String },
	country: { type: Types.Relationship, ref: 'Country' },
	province : { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
	city : { type: Types.Relationship, ref: 'City', filters: { province: ':province' } },
	highlights: { type: Types.TextArray},
	startingPoint : {type: String},
	finishPoint: {type: String},
  nOfReviews: {type: Types.Number, default: 0},
	nOfStars: {type: Types.Number, default: 4.5},
	reviews : { type: Types.Relationship, ref: 'Review', many: true },
  attraction: { type: Types.Relationship, ref: 'Attraction', index: true },
  createdAt: { type: Date, noedit: true },
	updatedAt: { type: Date, noedit: true },
	schedule : {type: Types.TextArray, label: 'Horas', note: 'Estos son los multiples horarios que tiene un tour, si hay horarios establecidos, de otro modo se mostrará un mensaje que diga coodinar al momento de la reserva.'},
  daysDisabled: { type: Types.TextArray, label: 'Dias Desactivados', note : '0 - Domingo, 1 - Lunes, 2 - Martes, 3 - Miercoles, 4 - Jueves, 5 - Viernes, 6 - Sábado'},
  skipDays : {type: Types.Number, default: 0, label: 'Dias con los que se necesita reservar con anticipación', note: 'Esto define el mínimo de días necesarios para hacer una reserva'},
  disabledDates : {type: Types.TextArray, label: 'Fechas no disponibles', note: 'Estas son las fechas donde no estará disponible el tour, se añadiran automáticamente al momento de un booking para ese día, o se podrán añadir manualmente, ej: para un día feriado. Formato: 2016-06-28'},
  multiPrice : {type : Types.Boolean, default:false},
  multiPriceCatalog : {type : Types.TextArray, dependsOn: { multiPrice: true }},
});

Tour.schema.virtual('content.full').get(function() {
	return this.description.extended || this.description.short;
});
Tour.relationship({ ref: 'Enquiry', path: 'enquiries', refPath: 'tour' });
Tour.relationship({ ref: 'Review', path: 'reviews'});
Tour.relationship({ ref: 'Collection', path: 'collections'});
Tour.defaultColumns = 'name, state|20%, author|20%, publishedDate|20%, -createdAt';
Tour.schema.pre('save', function(next) {
    this.tourId = this.id;
		now = new Date();
  	this.updatedAt = now;
  	if ( !this.createdAt ) {
    	this.createdAt = now;
  	}	
  	next()
});
Tour.register();
