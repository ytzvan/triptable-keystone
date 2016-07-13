var emailUtils = require('./lib/email');
var emailTemplates = require('./lib/emailTemplates');
var smsUtils = require('./lib/sms');

exports.Email = emailUtils;
exports.EmailTemplates = emailTemplates;
exports.Sms = smsUtils;