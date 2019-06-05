var keystone = require('keystone');
var User = keystone.list('User');
var Keen = require('keen-js');
var session = require('../../node_modules/keystone/lib/session');
var url = require('url');
var querystring = require('querystring');
var Email = require('../../utils').Email;
var EmailTemplates = require('../../utils').EmailTemplates;
var Mailchimp = require('../../utils').Mailchimp;
var Utils = require('../../utils').GeneralUtils;

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
  var redirectUrl;
	var locals = res.locals;
  locals.data = {
  };

	function renderView() {
		view.render('auth/register');
	}
  var onSuccess = function (user) {
        var origin = url.parse(req.headers.referer);
        var redirectUrl = querystring.parse(origin.query);
        if (user.isGuide) {
          return res.redirect('/admin');
        }
			  if (redirectUrl.from) {
				res.redirect(redirectUrl.from);
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

	view.on('post', { action: 'login' }, function(next) {
        var q = keystone.list('User').model.findOne().where('email', req.body.email);
        q.exec(function(err, result) {
          if (result){
            locals.data.validationErrors = 'El e-mail introducido ya se encuentra registrado';
            next();
            }
          else {
        var newUser = new User.model({
            name: {
                full: req.body.name
            },
            isGuide: req.body.isGuide,
            countryCode: req.body.countryCode,
           // mainActivity: req.body.mainActivity
        });
        var updater = newUser.getUpdateHandler(req);
        updater.process(req.body, {
            fields: 'email, password',
            flashErrors: true,
            logErrors: true
        }, function(err,result) {
            if (err) {
                //locals.data.validationErrors = err.detail.password.error;
                locals.data.validationErrors = "La contraseña debe ser mayor a 4 caracteres";
            } else {
                //recordEvent(result, req);
                req.flash('success', 'Cuenta creada. Por favor inicia sesión');
                if (process.env.NODE_ENV === 'production'){
                  // sendNotificationEmail(result); //Email interno
                //  Email.sendWelcomeEmail(result); // email a usuario registrado
                 // Mailchimp.addToMainList(result);
								//	Utils.addEventToMixPanel('Cuenta Creada');
                };
               // Utils.addPromoCodeToUser(result, req);
                //return res.redirect('/signin');
                return session.signin(req.body, req, res, onSuccess, onFail);
            }
            next();
        });

          } //if no exist
        }); //validate if exist or not
    });


    view.on('init', function(next) {
        redirectUrl = req.query.from;
        next();
    });
   view.render('crm');

  function sendNotificationEmail(result) {
    var subject = "Nuevo Usuario Registrado";
    console.log(result);
    var message = EmailTemplates.newUserRegister(result);//carga el template
     if (message){
        Email.notifyNewUser(result, subject, message); // en el callback envia el email
     };
    };
};
