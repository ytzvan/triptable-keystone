var keystone = require('keystone');
var request = require('request');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);

var options = {
    proxy: process.env.QUOTAGUARDSTATIC_URL,
    url: 'http://ip.jsontest.com/',
    headers: {
        'User-Agent': 'node.js'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
      next();
    }
}

request(options, callback);
view.render('/');
}



