var Mailgun = require('machinepack-mailgun');
var Email = require('keystone-email');
var moment = require('moment');

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

    emailNotificationTriptable : function (obj, subject, message) {
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

   sendWelcomeEmail : function (model) { //
      var template = template; //template name
      var to = process.env.TO;
      console.log(model);
      var mailgunApiKey = process.env.MAILGUN_APIKEY;
      var mailgunDomain = process.env.MAILGUN_DOMAIN;
      var locals = model;
      var templateOptions = {pretty: true, locals: locals};
      var templatePath = 'utils/email_templates/welcome.ejs';
      var subject = 'Bienvenido a Triptable '+ locals.name.first;
      var toArray = [
        to,
        { name: locals.name.first, email: locals.email }
      ];
      sendEmailTemplate(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain);
      return true;
      /* var emaill = new Email(templatePath).render(locals, function(err, result) {

          if (!err) {
            return res.send(result.html)
          }
        }); */


 },
 sendPendingConfirmationEmail : function (model) { //
    console.log(model);
    var template = template; //template name
    var to = process.env.TO;
    console.log(model);
    var mailgunApiKey = process.env.MAILGUN_APIKEY;
    var mailgunDomain = process.env.MAILGUN_DOMAIN;
    var locals = model;
    var templateOptions = {pretty: true, locals: locals};
    var templatePath = 'utils/email_templates/pending.ejs';
    var subject = 'Tu reserva de Triptable ';
    var toArray = [
      to,
      { name: model.name.first + " " + model.name.last, email: model.email }
    ];
    sendEmailTemplate(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain);
    return true;
    /* var emaill = new Email(templatePath).render(locals, function(err, result) {

        if (!err) {
          return res.send(result.html)
        }
      }); */


},

 askForFeedbackEmail : function (model) { //
    var template = template; //template name
    var to = process.env.TO;
    var mailgunApiKey = process.env.MAILGUN_APIKEY;
    var mailgunDomain = process.env.MAILGUN_DOMAIN;
    var locals = model;
    var templateOptions = {pretty: true, locals: locals};
    var templatePath = 'utils/email_templates/askForFeedback.ejs';
    var subject = 'Cuéntanos cómo estuvo el tour';
    var toArray = [
      to,
      { name: model.name.first + " " + model.name.last, email: model.email }
    ];
    sendEmailTemplate(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain);
    return true;
    /* var emaill = new Email(templatePath).render(locals, function(err, result) {

        if (!err) {
          return res.send(result.html)
        }
      }); */
},

testScheduledEmail : function () { //
    var model = {};
    var template = template; //template name
    var to = process.env.TO;
    var mailgunApiKey = process.env.MAILGUN_APIKEY;
    var mailgunDomain = process.env.MAILGUN_DOMAIN;
    var locals = model;
    var templateOptions = {pretty: true, locals: locals};
    var templatePath = 'utils/email_templates/testScheduledEmail.ejs';
    var subject = 'Scheduled Email';
    var toArray = [
      to,
      { name: "Ytzvan Mastino", email: "mastino14@gmail.com" }
    ];
    
    scheduledEmailTemplate(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain);
    return true;
    /* var emaill = new Email(templatePath).render(locals, function(err, result) {

        if (!err) {
          return res.send(result.html)
        }
      }); */
},

}

 var sendEmailTemplate = function(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain) {

    Email.send(
     templatePath,
     {transport: 'mailgun'},
     templateOptions,
     {
      to: toArray,
      subject: subject,
      from: { name: 'Triptable', email: 'hello@triptable.com' },
      apiKey: mailgunApiKey,
      domain: mailgunDomain,
    },
		function (err, result) {
			if (err) {
				console.error('🤕 Mailgun test failed with error:\n', err);
        return false;

			} else {
				console.log('📬 Successfully sent Mailgun test with result:\n', result);
     //   return true;
        return true;
			}
		}
	);

  }

  var scheduledEmailTemplate = function(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain) {
    var date = new Date().toUTCString();
    var date2 = moment(new Date());
    date2 = date2.add(3, 'days'); // No mas de 3 dias
    date2 = date2.toDate();
    date2 = date2.toUTCString();

    console.log("date", date);
    console.log("date2", date2);
    Email.send(
     templatePath,
     {transport: 'mailgun'},
     templateOptions,
     {
      to: toArray,
      subject: subject,
      from: { name: 'Triptable', email: 'hello@triptable.com' },
      apiKey: mailgunApiKey,
      domain: mailgunDomain,
      "o:deliverytime": date2
    },
		function (err, result) {
			if (err) {
				console.error('🤕 Mailgun test failed with error:\n', err);
        return false;

			} else {
				console.log('📬 Successfully sent Mailgun test with result:\n', result);
     //   return true;
        return true;
			}
		}
	);

  }


//module.exports = exports = Email;
