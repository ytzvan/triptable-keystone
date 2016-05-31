var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);
// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', middleware.crsfAuth);
keystone.pre('routes', middleware.userInfo);
keystone.pre('render', middleware.userInfo);

// Import Route Controller
var routes = {
	views: importRoutes('./views'),
	search: importRoutes('./search'),
	auth: importRoutes('./auth'),
	static: importRoutes('./static'),
	api: importRoutes('./api'),

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

  //API Routes - Tours
  app.get('/api/tour/list', keystone.middleware.api, routes.api.tour.list);
	app.all('/api/tour/create', keystone.middleware.api, routes.api.tour.create);
  app.get('/api/tour/:id', keystone.middleware.api, routes.api.tour.get);
	app.all('/api/tour/:id/update', keystone.middleware.api, routes.api.tour.update);
	app.get('/api/tour/:id/remove', keystone.middleware.api, routes.api.tour.remove);

	//Dinamic Views
	app.get('/blog/', routes.views.blog);
	app.get('/blog/:post', routes.views.post);
	app.get('/contact/:tourId', routes.views.booking);
	app.post('/contact/:tourId', routes.views.contact);
	app.all('/tour/:slug', routes.views.tour);
  app.all('/atracciones/:slug', routes.views.attractions);
	//Search Views
	app.get('/:country', routes.search.country);
	app.get('/:country/:province', routes.search.province);
	app.get('/:country/:province/:city', routes.search.city);


};

