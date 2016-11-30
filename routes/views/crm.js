var keystone = require('keystone');
var CRM = keystone.list('CRM');
var Email = require('../../utils').Email;
var EmailTemplates = require('../../utils').EmailTemplates;

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.section = 'crm';
	locals.enquiryTypes = CRM.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;

  view.on('init', function(next){
     // var x = Email.email(0);
      // console.log(x);
      next();
  });

	view.on('post', { action: 'contact' }, function (next) {

		var application = new CRM.model();
		var updater = application.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
        console.log(err);
			} else {
				locals.enquirySubmitted = true;

        var subject = "Conviértete en partner de Triptable";
        var message = EmailTemplates.newLead(req.body);//carga el template
        if (message){
          Email.sendEmail(req.body, subject, message); // en el callback envia el email
        }
				var notificationEmail = EmailTemplates.newPartner(req.body);
        Email.emailNotificationTriptable(req.body, "Nuevo partner registrado", notificationEmail); // en el callback envia el email de notificacion a nosotros.
			}
			next();
		});

	});

	view.render('crm', {
		section: 'crm',
	});

}