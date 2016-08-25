var Mailgun = require('machinepack-mailgun');
var Email = require('keystone-email');

module.exports = {
    sendEmail : function (obj, subject, message) {
       var name = obj["name.full"];
       Mailgun.sendHtmlEmail({
          apiKey: process.env.MAILGUN_APIKEY,
          domain: process.env.MAILGUN_DOMAIN,
          toEmail: obj.email,
          toName: name,
          subject: subject,
          htmlMessage: message,
          textMessage: message,
          fromEmail: process.env.DEFAULT_EMAIL,
          fromName:  'Triptable',
        }).exec({
        // An unexpected error occurred.
        error: function (err){
          return false;
        },
        // OK.
        success: function (){
          return true;
        },
      });
    },

    notifyNewUser : function (obj, subject, message) {
       var name = obj["name.full"];
       Mailgun.sendHtmlEmail({
          apiKey: process.env.MAILGUN_APIKEY,
          domain: process.env.MAILGUN_DOMAIN,
          toEmail: "hello@triptable.com",
          toName: name,
          subject: subject,
          htmlMessage: message,
          textMessage: message,
          fromEmail: process.env.DEFAULT_EMAIL,
          fromName:  'Triptable',
        }).exec({
        // An unexpected error occurred.
        error: function (err){
          return false;
        },
        // OK.
        success: function (){
          return true;
        },
      });
    },

    sendTemplateEmail : function (req, res) {
      var template = process.env.TEMPLATE;
      var to = process.env.TO;

      var mailgunApiKey = process.env.MAILGUN_APIKEY;
      var mailgunDomain = process.env.MAILGUN_DOMAIN;
      var locals = {	name:	'Ytzvan', supplies:	['mop', 'broom', 'duster']	};
      var templateOptions = {pretty: true, locals: locals};
      var templatePath = 'utils/email_templates/welcome.ejs';

      var toArray = [
        to,
        { name: 'Ytzvan Mastino', email: 'y@triptable.com' }
      ];

      /* var emaill = new Email(templatePath).render(locals, function(err, result) {

          if (!err) {
            return res.send(result.html)
          }
        }); */

    Email.send(
     templatePath,
     {transport: 'mailgun'},
     templateOptions,
     {
      to: toArray,
      subject: 'Bienvenido a Triptable',
      from: { name: 'Triptable', email: 'hello@triptable.com' },
      apiKey: mailgunApiKey,
      domain: mailgunDomain,
    },
		function (err, result) {
			if (err) {
				console.error('🤕 Mailgun test failed with error:\n', err);
       // return false;
        
			} else {
				console.log('📬 Successfully sent Mailgun test with result:\n', result);
     //   return true;
        return res.redirect('/panama');
			}
		}
	);

		// Email options

		// Template locals
		// Send options
		// callback
 },


}


//module.exports = exports = Email;