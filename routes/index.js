var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', middleware.crsfAuth);
keystone.pre('routes', middleware.userInfo);
keystone.pre('render', middleware.userInfo);
keystone.pre('routes', middleware.isAdmin);
keystone.pre('render', middleware.isAdmin);

// Import Route Controller
var routes = {
	views: importRoutes('./views'),
	search: importRoutes('./search'),
	auth: importRoutes('./auth'),
	static: importRoutes('./static'),

};
// Setup Route Bindings
exports = module.exports = function(app) {

	// Views
	app.get('/', routes.views.index);
	//Static views
	app.all('/signup', routes.auth.signup);
	app.all('/signin', routes.auth.signin);
  app.all('/nosotros', routes.static.about_us);
  app.all('/terminos', routes.static.terms);
  app.all('/partners', routes.views.crm);
  app.all('/user', middleware.requireUser, routes.views.user.home);

	//Dinamic Views
	app.get('/blog/', routes.views.blog);
	app.get('/blog/:post', routes.views.post);
	app.get('/contact/:tourId', middleware.requireUser, routes.views.booking); //Donde se llena la data
	app.post('/contact/:tourId', middleware.requireUser, routes.views.contact); //al momento del post
	app.all('/tour/:slug', routes.views.tour);
	//Search Views
	app.get('/:country', routes.search.country);
	app.get('/:country/:province', routes.search.province);
	app.get('/:country/:province/:city', routes.search.city);


};

