  var request = require('request');
  var rootUrl = "https://us9.api.mailchimp.com/3.0/";

module.exports = {
  addToMainList : function (obj) {
    var email = obj.email;
    var name = obj.name.first;
    var lastName = obj.name.last;
    var data = {
      "email_address": email,
      "status": "subscribed",
      "merge_fields": {
        "FNAME": name,
        "LNAME": lastName
      } };
     var body = JSON.stringify(data);

    var options = {
      method: 'POST',
      url: rootUrl+'lists/102795c6fa/members' ,
      headers: {
        'content-type': 'application/json'
      },
     auth: {
        'user': 'triptable',
        'pass': 'a8899146c9130153c01d009f65537e39-us9',
      },
      body :  body
    };

    function callback(error, response, cb) {
        if (!error && response.statusCode == 200) {
          return true;
        } else {
          return false;
        }
      }

    request(options, callback);
  }
}