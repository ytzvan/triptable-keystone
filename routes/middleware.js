var _ = require('underscore');
var keystone = require('keystone');
var passport = require('passport');
var Keen = require('keen-js');
var i18n = require("i18n");
var locale = require("locale");
var supported = new locale.Locales(["en", "en_US", "es", "es_ES", "pt"]);
var url = require('url');
  
/**
	Initialises the standard view locals
*/

exports.initLocals = function(req, res, next) {

	var locals = res.locals;

	locals.navLinks = [
		{ label: 'Home',		key: 'home',		href: '/' },
		{ label: 'Blog',		key: 'blog',		href: '/blog' },
		{ label: 'Contact',		key: 'contact',		href: '/contact' }
	];

	locals.user = req.user;

	next();

};

exports.crsfAuth = function (req, res, next) {
	var locals = res.locals;
	var csrf = keystone.security.csrf;
	locals.token = {
		key : csrf.TOKEN_KEY,
		value : csrf.getToken(req, res)
	};

	next();
}

/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.initErrorHandlers = function(req, res, next) {

    res.err = function(err, title, message) {
        res.status(500).render('errors/500', {
            err: err,
            errorTitle: title,
            errorMsg: message
        });
    }

    res.notfound = function() {
        res.status(404).render('errors/404');
    }

    next();

};

exports.flashMessages = function(req, res, next) {

	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};

	res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;

	next();

};


/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {
  var locals = res.locals;
	if (!req.user) {
    req.session.loginError = "Por favor incia sesión para continuar";
		res.redirect('/signin?from='+req.url);
	} else {
		next();
	}

};

exports.requireGuide = function(req, res, next) {
 var locals = res.locals;
  if (req.user) {
    if (req.user.isGuide == true) { //Es Guia
      next();
    } else {
      req.session.loginError = "No tienes permisos para ver esta página";
		  res.redirect('/signin?from='+req.url);
    }
  }
    else { // Requiere Login
      req.session.loginError = "Por favor incia sesión para continuar";
		  res.redirect('/signin?from='+req.url);
    }

};

exports.isAdmin = function (req, res, next) {
  var locals = res.locals;
  if (req.user) {
    if (req.user.isAdmin == true) {
      locals.isAdmin = true;
      next();
    } else {
      locals.isAdmin = false;
      next();
    }
  }
    else {
      next();
    }
};
exports.isGuide = function (req, res, next) {
  var locals = res.locals;
  if (req.user) {
    if (req.user.isGuide == true) {
      locals.isGuide = true;
      next();
    } else {
      locals.isGuide = false;
      next();
    }
  }
    else {
      next();
    }
};

exports.userInfo = function(req, res, next) {
	var locals = res.locals;
	if (req.user) {
		locals.userInfo = req.user;
		next();
	} else {
		locals.userInfo = null;
		next();
	}
};

exports.intl = function (req, res, next) {
i18n.configure({
  locales: ['es', 'en'],
  cookie: 'lang',
  directory: './templates/locales',
  queryParameter: 'lang'
});


// detect browser lang.
var browserLang = req.headers["accept-language"];
browserLang = browserLang.substring(0, 2);

//get subdomain
var subdomain = req.subdomains[0];
var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;



/*else {
  if (req.query.lang === 'es') {
      process.env.LANG = 'es';
      return res.redirect('http://www.localdomain.com:3000');
    }
    if (req.query.lang === 'en') {
      process.env.LANG = 'en';
      return res.redirect('http://en.localdomain.com:3000');
    }
} */

if (subdomain == 'www') {
    process.env.LANG = 'es';
    i18n.setLocale(process.env.LANG);
  }
if (subdomain == 'en') {
    process.env.LANG = 'en';
    i18n.setLocale(process.env.LANG);
}



/*if (subdomain != 'www') {
  process.env.LANG = subdomain;
  i18n.setLocale(process.env.LANG);
  return next();
} else {
  process.env.LANG = browserLang;
  i18n.setLocale(process.env.LANG);
  return next();
} */

/* if (!process.env.LANG) {
   process.env.LANG = browserLang;
    i18n.setLocale(process.env.LANG);
}
  if (req.query.lang) {
    process.env.LANG = req.query.lang;
    i18n.setLocale(process.env.LANG);
  } */
  next();
};

