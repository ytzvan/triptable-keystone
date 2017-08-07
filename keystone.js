// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();
require('newrelic');

// Require keystone
var keystone = require('keystone');
var handlebars = require('express-handlebars');

keystone.init({

	'name': 'Triptable',
	'brand': 'Triptable',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'hbs',

	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/views/partials',
		defaultLayout: 'main',
		helpers: new require('./templates/views/helpers')(),
		extname: '.hbs'
	}).engine,

	'emails': 'templates/emails',
	'mongo': process.env.MONGO_URI,
	'auto update': true,
	'session': true,
	//'session store': 'mongo',
	'auth': true,
	'user model': 'User',
	'signin url': '/signin',
	'signin redirect' : '/',
	//'signout url' : '/signout',
	//'signout redirect' : '/'
});
keystone.set('s3 config', { bucket: 'triptable', key: 'AKIAJGHX437Z664RXBXA', secret: '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' });

keystone.import('models');

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

keystone.set('routes', require('./routes'));


keystone.set('email locals', {
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
});

keystone.set('email rules', [{
	find: '/images/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/images/' : 'http://localhost:3000/images/'
}, {
	find: '/keystone/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/keystone/' : 'http://localhost:3000/keystone/'
}]);

keystone.set('email tests', require('./routes/emails'));

//keystone.set('session options', { cookie: { domain:'.localdomain.com:3000', path: '/', secure: true,  maxAge   : 1000*60*60*24*30*12 }});
keystone.set('nav', {
	'posts': ['posts', 'post-categories'],
	'enquiries': 'enquiries',
	'users': 'users',
	'tours' : 'tours',
  'attractions' : 'attractions',
  'reviews' : 'reviews',
	'locations' : ['countries', 'provinces', 'cities'],
  'crms' : 'crms',
  'PromoCode' : 'PromoCode'
});
keystone.start();
