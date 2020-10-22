var keystone = require('keystone');
var middleware = require('./middleware');
var proxy = require('express-http-proxy');
var importRoutes = keystone.importer(__dirname);
var Redis = require('ioredis');

var cert = "/Users/ytzvan/triptable-keystone/do-redis.crt";

var client = new Redis(process.env.REDIS_URL);

var cache = require('express-redis-cache')({
	client: client
})



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
	utils: importRoutes('./utils'),
	api: importRoutes('./api'),
	widget: importRoutes('./widget'),
};
// Setup Route Bindings
exports = module.exports = function(app) {
	app.get('/', /*function (req, res, next) {
		if (req.session.userId) {
			console.log(req.session.userId);
			console.log("using cache: false");
			res.use_express_redis_cache = false;
			next();
		}
		else {
			let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
			pathUrl = path;
			console.log("using cache: true");
			console.log("path", this.pathUrl);
			res.express_redis_cache_name = path;
			next();
		}
	}, cache.route(),*/routes.views.index);
	
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
  app.all('/admin/booking/list', middleware.requireGuide, routes.admin.home.index);
  app.all('/admin/booking/:id', middleware.requireGuide, routes.admin.booking.index);
	app.post('/admin/booking/:id/update', middleware.requireGuide, routes.admin.booking.update);
	app.all('/admin/tour/add', middleware.requireGuide, routes.admin.tour.add);
	app.all('/admin/tour/addImages', middleware.requireGuide, routes.admin.tour.addImages);
	app.all('/admin/tour/list', middleware.requireGuide, routes.admin.tour.list);
	app.all('/admin/tour/edit/:id', middleware.requireGuide, routes.admin.tour.edit);
	app.all('/admin/tour/delete/:id', middleware.requireGuide, routes.admin.tour.delete);
	app.all('/admin/profile', middleware.requireUser, routes.admin.profile.show);
	app.post('/admin/profile/update', middleware.requireUser, routes.admin.profile.update);
	app.post('/admin/profile/addImage', middleware.requireUser, routes.admin.profile.addImage);
  app.all('/admin',middleware.requireGuide, routes.dashboard.index.init);
	app.get('/mybooking', routes.v2.myBookings.index);
	app.post('/mybooking', routes.v2.myBookings.getInvoice);
	app.get('/destino/:city', function (req, res, next) {
		if (req.session.userId) {
			res.use_express_redis_cache = false;
			next();
		}
		else {
			let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
			res.express_redis_cache_name = path;
			next();
		}
	}, cache.route(), routes.search.city);
	app.all('/search', routes.search.search);
	//WIDGET
	app.get('/w/:widgetId', routes.widget.widget.init);
	//User
	app.all('/u/:userid', function (req, res, next) {
		if (req.session.userId) {
			console.log(req.session.userId);
			console.log("using cache: false");
			res.use_express_redis_cache = false;
			next();
		}
		else {
		let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
		res.express_redis_cache_name = path;
		next();
		}
	}, cache.route(),routes.views.operator.index);
	//Collections
	app.get('/c/:cid', function (req, res, next) {
		if (req.session.userId) {
			console.log(req.session.userId);
			console.log("using cache: false");
			res.use_express_redis_cache = false;
			next();
		}
		else {
		let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
		res.express_redis_cache_name = path;
		next();
		}
	}, cache.route(), routes.views.collection.getCollection);
	//app.get('/c/', routes.views.collection.getAllCollections);
	app.get('/l/:lid', function (req, res, next) {
		if (req.session.userId) {
			console.log(req.session.userId);
			console.log("using cache: false");
			res.use_express_redis_cache = false;
			next();
		}
		else {
			let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
			res.express_redis_cache_name = path;
			next();
		}
	}, cache.route(), routes.views.collection.getLanding);
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
	
	app.all('/tour/:slug', function (req, res, next) {
		if (req.session.userId) {
			console.log(req.session.userId);
			console.log("using cache: false");
			res.use_express_redis_cache = false;
			next();
		}
		else {
			let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
			res.express_redis_cache_name = path;
			next();
		}
	}, cache.route(), routes.views.tour);

	//V1 API Routes
	app.all("/api*", keystone.middleware.cors);
	app.get('/api/tours', keystone.middleware.api, routes.api.tour.list);
	app.get('/api/tour/:id', keystone.middleware.api, routes.api.tour.get);
	app.get('/api/country', keystone.middleware.api, routes.api.country.getCountries);
	app.get('/api/country/:id', keystone.middleware.api, routes.api.country.getCountry);
	app.get("/api/home/:id", keystone.middleware.api, routes.api.country.getLocalHome);


	//Search Views
	app.get('/:country', function (req, res, next) {
		if (req.session.userId) {
			console.log(req.session.userId);
			console.log("using cache: false");
			res.use_express_redis_cache = false;
			next();
		}
		else {
			let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
			res.express_redis_cache_name = path;
			next();
		}
	}, cache.route(), routes.search.country);
	app.get('/:country/:province', function (req, res, next) {
		if (req.session.userId) {
			console.log(req.session.userId);
			console.log("using cache: false");
			res.use_express_redis_cache = false;
			next();
		}
		else {
			let path = req.url + '~' + process.env.LANG + '~' + res.locals.session.userCurrency.value;
			res.express_redis_cache_name = path;
			next();
		}
	}, cache.route(), routes.search.province);


	//Fallback
	app.all('*', function (req, res){
		res.status(404).render('errors/404');
	});

	cache.on('message', function (message) {
		console.log("message", message);
	});


		cache.on('connected', function () {
			console.log("connected");
		});

if (process.env.DELETE_CACHE) {
	cache.del('/*', function(err, del){ 
		console.log("del", del) 
	});
}



};
