var keystone = require('keystone');
var middleware = require('./middleware');
var proxy = require('express-http-proxy');
var importRoutes = keystone.importer(__dirname);
// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', middleware.crsfAuth);
keystone.pre('routes', middleware.userInfo);
//keystone.pre('render', middleware.userInfo);
keystone.pre('routes', middleware.isAdmin);
//keystone.pre('render', middleware.isAdmin);
keystone.pre('routes', middleware.isGuide);
//keystone.pre('render', middleware.isGuide);
keystone.pre('routes', middleware.intl);
keystone.pre('routes', middleware.setCurrency);
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
  app.all('/about', routes.static.index.index);
  app.all('/nosotros', routes.static.index.index);
  app.all('/faq', routes.static.index.faq);
  app.all('/como-funciona', routes.static.index.faq);
  app.all('/terms', routes.static.index.terms);
  app.all('/terminos', routes.static.index.terms);
  app.all('/partners', routes.views.crm);
  app.all('/user', middleware.requireUser, routes.views.user.home);
  app.all('/admin', middleware.requireGuide, routes.admin.home.index);
  app.all('/admin/booking/:id', middleware.requireGuide, routes.admin.booking.index);
	app.post('/admin/booking/:id/update', middleware.requireGuide, routes.admin.booking.update);
	//app.all('/admin/tour/add', middleware.requireGuide, routes.admin.tour.add);
	//app.all('/admin/tour/list', middleware.requireGuide, routes.admin.tour.list);
  app.all('/dashboard',middleware.requireGuide, routes.dashboard.index.init);
	app.get('/mybooking', routes.v2.myBookings.index);
	app.post('/mybooking', routes.v2.myBookings.getInvoice);
  app.get('/destino/:city', routes.search.city);
  app.all('/search', routes.search.search);
	//User
	app.all('/u/:userid', routes.views.operator.index);
	
 	//functions
	app.get('/utils/actions/cartAbandon', routes.utils.index.cartAbandon);
	app.get('/currency/:currency', routes.utils.index.setCurrency);

  //Attractions
  app.get('/attractions', routes.views.attractions.index);
  app.get('/atracciones', routes.views.attractions.index);
  app.get('/attractions/:slug', routes.views.attractions.single);

	//Dinamic Views
	app.all('/booking/:tourId', routes.views.booking); //Donde se llena la data
	app.post('/contact/:tourId', routes.views.contact); //al momento del post
	app.get('/invoice/:enquiryId', routes.views.invoice);
	
	app.all('/tour/:slug', routes.views.tour);
	//Search Views
	app.get('/:country', routes.search.country);
	app.get('/:country/:province', routes.search.province);


	//Fallback
	app.all('*', function (req, res){
		res.status(404).render('errors/404');
	});


};
