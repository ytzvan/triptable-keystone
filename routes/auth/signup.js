var keystone = require('keystone');
var User = keystone.list('User');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
    locals.data = {};
	console.log(req.body);

	view.on('post', { action: 'login' }, function(next) {
        var newUser = new User.model({
            name: {
                full: req.body.name
            }
        });
        var updater = newUser.getUpdateHandler(req);
        updater.process(req.body, {
            fields: 'email, password',
            flashErrors: true,
            logErrors: true
        }, function(err,result) {
            if (err) {      
                locals.data.validationErrors = err.errors; 
                console.log(err.errors);
            } else {
                req.flash('success', 'Account created. Please sign in.');               
                return res.redirect('/signin');
            }
            next();
        });

    });


    view.on('init', function(next) {
        next();
    });
	
    view.render('auth/register');

};