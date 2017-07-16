var keystone = require('keystone');
var middleware = require('./middleware');
var proxy = require('express-http-proxy');
var importRoutes = keystone.importer(__dirname);
// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', middleware.crsfAuth);
keystone.pre('routes', middleware.userInfo);
keystone.pre('render', middleware.userInfo);
keystone.pre('routes', middleware.isAdmin);
keystone.pre('render', middleware.isAdmin);
keystone.pre('routes', middleware.isGuide);
keystone.pre('render', middleware.isGuide);

keystone.pre('routes', middleware.intl);

// Import Route Controller
var routes = {
	views: importRoutes('./views'),
	search: importRoutes('./search'),
	auth: importRoutes('./auth'),
	static: importRoutes('./static'),
	admin: importRoutes('./admin'),
	dashboard: importRoutes('./dashboard'),
	v2: importRoutes('./v2'),
	utils: importRoutes('./utils')
};
// Setup Route Bindings
exports = module.exports = function(app) {

	// Views
	app.get('/', routes.views.index);
	//Static views
	app.all('/signup', routes.auth.signup);
	app.all('/signin', routes.auth.signin);
  app.all('/nosotros', routes.static.about_us);
   app.all('/como-funciona', routes.static.how_it_works);
  app.all('/terminos', routes.static.terms);
  app.all('/partners', routes.views.crm);
  app.all('/user', middleware.requireUser, routes.views.user.home);
  app.all('/admin', middleware.requireGuide, routes.admin.home.index);
  app.all('/admin/booking/:id', middleware.requireGuide, routes.admin.booking.index);
  app.post('/admin/booking/:id/update', middleware.requireGuide, routes.admin.booking.update);
  app.all('/dashboard',middleware.requireGuide, routes.dashboard.index.init);
  app.all('/v2', middleware.requireGuide, routes.v2.index.init);
  app.all('/v2/tour/:slug', middleware.requireGuide, routes.v2.tour.init);
  app.get('/destino/:city', routes.search.city);
	
 	//functions
	app.get('/utils/actions/cartAbandon', routes.utils.index.cartAbandon);

  //Attractions
  app.get('/attractions', routes.views.attractions.index);
  app.get('/atracciones', routes.views.attractions.index);
  app.get('/attractions/:slug', routes.views.attractions.single);

	//Dinamic Views
	app.get('/contact/:tourId', middleware.requireUser, routes.views.booking); //Donde se llena la data
	app.post('/contact/:tourId', middleware.requireUser, routes.views.contact); //al momento del post
	app.all('/tour/:slug', routes.views.tour);
	//Search Views
	app.get('/:country', routes.search.country);
	app.get('/:country/:province', routes.search.province);



	//Fallback
	app.all('*', function (req, res){
		res.status(404).render('errors/404');
	});


};
