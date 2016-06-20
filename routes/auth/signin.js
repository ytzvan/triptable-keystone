var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;
	var csrf = keystone.security.csrf;
	locals.validationErrors = {};
	locals.token = {
		key : csrf.TOKEN_KEY,
		value : csrf.getToken(req, res)
	};
	function renderView() {
		view.render('auth/signin');
	}

	// If a form was submitted, process the login attempt
	if (req.method === 'POST') {
		if (!csrf.validate(req)) {
			req.flash('error', 'There was an error with your request, please try again.');
			locals.validationErrors = {
				csrfError : "Hubo un problema al procesar su solicitud, por favor actualize la página"
			};
			return renderView();
		}

		if (!req.body.email || !req.body.password) {
			locals.validationErrors = {
				isEmpty : "Por favor introduzca un e-mail y una contraseña"
			};
			return renderView();
		}

		var onSuccess = function (user) {
			console.log(user);
			if (req.query.from && req.query.from.match(/^(?!http|\/\/|javascript).+/)) {
				res.redirect(req.query.from);
			} else if ('string' === typeof keystone.get('signin redirect')) {
				res.redirect(keystone.get('signin redirect'));
			} else if ('function' === typeof keystone.get('signin redirect')) {
				keystone.get('signin redirect')(user, req, res);
			} else {
				res.redirect('/');
			}

		};

		var onFail = function (err) {
			var message = (err && err.message) ? err.message : 'El e-mail introducido y la contraseña no coinciden.';
			req.flash('error', message );
			locals.validationErrors = {
				mismatch : message
			};
			renderView();
		};

		session.signin(req.body, req, res, onSuccess, onFail);

	} else {
		renderView();
	}

};
