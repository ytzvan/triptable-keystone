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
  var client = new Keen({
    projectId: "577145c107271968d3a2107d", // String (required always)
    writeKey: "5f180e718b659d108d1517d2be385b5e5c2f9740dc0758649d78935f971c27fb77f1d7462a33c1e2dca28ba69d63e61fd357a5b348ad5c325a66bab2ecbb58f8011cc0d765bfa6a48d483a7b582a247e13786047447585db3db1144d65d6fb9b",   // String (required for sending data)
    readKey: "5887be55748985be44af2f0ac6dbb041a7f122865b17080f8acf237991e2cc49feb1b7fdfc2ec204988fdbca4dfd6963a057f6dc4424b071c2ac2f58b041b82adf885d424309c744d6cc346a41e6126d52ae0e5e9dfeb5832c485406e8f3c4f4",      // String (required for querying data)

    protocol: "https",         // String (optional: https | http | auto)
    // host: "api.keen.io/3.0",   // String (optional)
    // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
  });

	function renderView() {
		view.render('auth/signin');
	}
  var onSuccess = function (user) {
        var origin = url.parse(req.headers.referer);
        var redirectUrl = querystring.parse(origin.query);
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
              req.flash('error', 'El e-mail introducido ya se encuentra registrado.');
              return res.redirect('/signup');
          //    next();
            }
          else {

        var newUser = new User.model({
            name: {
                full: req.body.name
            }
        });
        var updater = newUser.getUpdateHandler(req);
        updater.process(req.body, {
            fields: 'email, password, referalCode',
            flashErrors: false,
            logErrors: true
        }, function(err,result) {
            if (err) {
                locals.data.validationErrors = err.errors;
            } else {
                //recordEvent(result, req);
                req.flash('success', 'Cuenta creada. Por favor inicia sesión');
                if (process.env.NODE_ENV === 'production'){
                  sendNotificationEmail(result);
                  Email.sendWelcomeEmail(result);
                  Mailchimp.addToMainList(result);
                };
                Utils.addPromoCodeToUser(result, req);
                //return res.redirect('/signin');
                return session.signin(req.body, req, res, onSuccess, onFail);
            }
            next();
        });

          } //if no exist
        }); //validate if exist or not
    });


    view.on('init', function(next) {
         console.log(req.url);
          console.log(req.query.from);
        redirectUrl = req.query.from;
        next();
    });
   view.render('auth/register');

  function recordEvent(data, req){
    var ip = req.headers['x-forwarded-for'];
    var signUpEvent = {
      name: data.name.full,
      id: data._id,
      email: data.email,
      ip : ip,
      keen: {
        timestamp: new Date().toISOString()
      }
    };

    // Send it to the "purchases" collection
     client.addEvent("signup", signUpEvent, function(err, res){
      if (err) {
        return true;
      }
      else {
         return true;
      }
    });
  };

  function sendNotificationEmail(result) {
    var subject = "Nuevo Usuario Registrado";
    console.log(result);
    var message = EmailTemplates.newUserRegister(result);//carga el template
     if (message){
        Email.notifyNewUser(result, subject, message); // en el callback envia el email
     };
    };
};