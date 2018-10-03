// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();
require('newrelic');

// Require keystone
var keystone = require('keystone');
var handlebars = require('express-handlebars');
var connectMongo = require('connect-mongo');
keystone.init({

	'name': 'Triptable',
	'brand': 'Triptable',
	'less': 'public',
	'static': 'public/v2',
	'favicon': 'public/favicon.ico',
	'views': 'templates/v2',
	'view engine': 'hbs',

	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/v2/partials',
		defaultLayout: 'v2',
		helpers: new require('./templates/views/helpers')(),
		extname: '.hbs'
	}).engine,

	'emails': 'templates/emails',
	'mongo': process.env.MONGO_URI,
	'auto update': true,
	'session': true,
	'session store': 'mongo',
	'auth': true,
	'user model': 'User',
	'signin url': '/signin',
	'signin redirect' : '/',
	'signout url' : '/signout',
	'signout redirect' : '/',
	'compress':true,
	'session options': {    
		cookie: { domain:'.'+process.env.LOCALDOMAIN,  httpOnly: true  }
  }
//	'sesssion store options' : {cookie: { domain:'.localdomain.com'}}
		// 'cookie signin options' : { 'maxAge': 5 * 60 * 1000, 'signed': true },
//	'session cookie' : { 'secure': true,'maxAge': 5 * 30 * 1000, 'domain':'.localdomain.com' },
	// 'session store': function(session){
	// 	console.log(session);
	// 	return new (connectMongo(session))({
	// 		url: process.env.MONGO_URI,
	// 		cookie: { domain:'.localdomain.com'}
  //   });
  // }
});
keystone.set('s3 config', { bucket: 'triptable', key: 'AKIAJGHX437Z664RXBXA', secret: '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' });
keystone.set("cors allow origin", true);
keystone.import('models');

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

keystone.set('routes', require('./routes'));


/*keystone.set('email locals', {
	logo_src: '/images/logo-email.gif',
	logo_width: 194,
	logo_height: 76,
	theme: {
		email_bg: '#f9f9f9',
		link_color: '#2697de',
		buttons: {
			color: '#fff',
			background_color: '#2697de',
			border_color: '#1a7cb7'
		}
	}
}); */

/*keystone.set('email rules', [{
	find: '/images/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/images/' : 'http://localhost:3000/images/'
}, {
	find: '/keystone/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/keystone/' : 'http://localhost:3000/keystone/'
}]); */

//keystone.set('email tests', require('./routes/emails'));

//keystone.set('session options', { cookie: { domain:'localdomain.com:3000', path: '/', secure: true,  maxAge   : 1000*60*60*24*30*12 }});
keystone.set('nav', {
	'enquiries': 'enquiries',
	'users': 'users',
	'tours' : 'tours',
	'locations' : ['cities', 'provinces', 'countries'],
	'collections' : ['collections'],
  	'crms' : 'crms'
});

keystone.start({
    onStart: function() {
    	updateCurrencyFile();
    }
});

function updateCurrencyFile() {
	var oxr = require('open-exchange-rates'),
	fx = require('money');
	//fx.settings = { from: "USD"};
	var jsonfile = require('jsonfile');
	 oxr.set({ app_id: process.env.OXR_API_KEY })
	 oxr.latest(function(err, result) {
	 	if (err) {
	 		var rates =  __dirname + 'routes/rates.json';
		  	jsonfile.readFile(rates, function(err, result) {
			    fx.rates =  result;
			    fx.base = "USD";
			    var appData = keystone.app.locals;
				appData.currency = "USD";
			    return true;
		  	});
	 	} else {
		fx.rates =  oxr.rates;
		fx.base = "USD";
		return result;
		} 
	});
}
