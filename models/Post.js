var keystone = require('keystone');
var Types = keystone.Field.Types;
var moment = require('moment');
moment.locale('es', {
    months : "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split("_"),
    monthsShort : "en._feb._mar_abr._mayo_jun_jul._ago_sept._oct._nov._dec.".split("_"),
    weekdays : "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
    weekdaysShort : "dom._lun._mar._mier._jue._vie._sáb.".split("_"),
    weekdaysMin : "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),
    relativeTime : {
      future : "en %s",
        past : "hace %s",
        s : "quelques secondes",
        m : "un minuto",
        mm : "%d minutos",
        h : "una hora",
        hh : "%d horas",
        d : "un día",
        dd : "%d días",
        M : "un mes",
        MM : "%d meses",
        y : "un año",
        yy : "%d años"
    },

	});
moment.locale('es');

/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true }
});

Post.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
  datePretty: {type: String},
	image: { type: Types.CloudinaryImage },
  content: { type: Types.Markdown, height: 400},
  brief: {type: Types.Textarea },
	categories: { type: Types.Relationship, ref: 'BlogCategory', many: true }
});

Post.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});
Post.schema.pre('save', function(next) {
  var date = this.publishedDate;
	var datePretty = moment(date).fromNow();
	this.datePretty = datePretty;
	next();
});
Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Post.register();
