var emailUtils = require('./lib/email');
var emailTemplates = require('./lib/emailTemplates');
var smsUtils = require('./lib/sms');
var mailchimpUtils = require('./lib/mailchimp');

exports.Email = emailUtils;
exports.EmailTemplates = emailTemplates;
exports.Sms = smsUtils;
exports.Mailchimp = mailchimpUtils;