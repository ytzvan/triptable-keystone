var keystone = require('keystone');
var User = keystone.list('User');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
  locals.data = {
  };

	view.on('post', { action: 'login' }, function(next) {
        var q = keystone.list('User').model.findOne().where('email', req.body.email);
        q.exec(function(err, result) {
          if (result){
            console.log(result);
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
            fields: 'email, password',
            flashErrors: false,
            logErrors: true
        }, function(err,result) {
            if (err) {
                locals.data.validationErrors = err.errors;
                console.log(err.errors);
            } else {
                req.flash('success', 'Cuenta creada. Por favor inicia sesión');
                return res.redirect('/signin');
            }
            next();
        });

          } //if no exist
        }); //validate if exist or not
    });


    view.on('init', function(next) {
        next();
    });
     console.log(locals.data)
    view.render('auth/register');

};