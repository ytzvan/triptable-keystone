var _ = require('underscore');
var keystone = require('keystone');
var passport = require('passport');
var Keen = require('keen-js');

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

