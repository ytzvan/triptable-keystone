var Mailgun = require('machinepack-mailgun');

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

}


//module.exports = exports = Email;