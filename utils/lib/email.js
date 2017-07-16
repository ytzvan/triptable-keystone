var Mailgun = require('machinepack-mailgun');
var Email = require('keystone-email');
var moment = require('moment');
var upperCase = require('upper-case')
var mailgunApiKey = process.env.MAILGUN_APIKEY;
var mailgunDomain = process.env.MAILGUN_DOMAIN;

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
      { name: model.name, email: model.email }
    ];
    sendEmailTemplate(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain);
    return true;
    /* var emaill = new Email(templatePath).render(locals, function(err, result) {

        if (!err) {
          return res.send(result.html)
        }
      }); */


},

 sendConfirmationEmailToUser: function(model) {
    var bookingId = upperCase(model.friendlyId);
    var mailgunApiKey = process.env.MAILGUN_APIKEY;
    var mailgunDomain = process.env.MAILGUN_DOMAIN;
    var locals = model;
    var templateOptions = {pretty: true, locals: locals};
    var templatePath = 'utils/email_templates/bookings/sendConfirmationEmailToUser.ejs';
    var subject = 'Confirmación de Reserva ID '+ bookingId;
     var toArray = [
       { name: model.name.first + " " + model.name.last, email: model.operatorEmail},
      { name: model.name.first + " " + model.name.last, email: "hello@triptable.com"},
    ];

    sendEmailTemplate(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain);
    return true;
  
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

cartAbandonEmail : function (req, model) { //
    var model = model
    var template = template; //template name
    var to = process.env.TO;
    var mailgunApiKey = process.env.MAILGUN_APIKEY;
    var mailgunDomain = process.env.MAILGUN_DOMAIN;
    var locals = model;
    var templateOptions = {pretty: true, locals: locals};
    var templatePath = 'utils/email_templates/cartAbandon.ejs';
    var subject = 'Completa tu Reserva del tour ' + model.tour;
    var toArray = [
      to,
      { name: model.name, email: model.email }
    ];
    var daysToAdd = 1;
    if (!req.session.emailSend) { //verifica que el email no se haya enviado mas de 1 vez por sessión. 
      scheduledEmailTemplate(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain, daysToAdd);
      req.session.emailSend = 1;  
    }
    return true;
    /* var emaill = new Email(templatePath).render(locals, function(err, result) {

        if (!err) {
          return res.send(result.html)
        }
      }); */
},

}

 var sendEmailTemplate = function(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain) {

   if (process.env.SEND_EMAILS == true) {

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
  } else {
    return false;
  }

  }

  var scheduledEmailTemplate = function(templatePath, subject, templateOptions, toArray, mailgunApiKey, mailgunDomain, daysToAdd) {
    var date = new Date().toUTCString();
    var date2 = moment(new Date());
    date2 = date2.add(daysToAdd, 'days'); // No mas de 3 dias
    date2 = date2.toDate();
    date2 = date2.toUTCString();

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
