var keystone = require('keystone');
var request = require('request');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);

var options = {
    proxy: process.env.QUOTAGUARDSTATIC_URL,
    url: 'http://api.ipify.org',
    headers: {
        'User-Agent': 'node.js'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        res.setHeader('Content-Type', 'application/json');
         return  res.send(JSON.stringify(body));
       next();
    } else {
      return view.render('index');
    }
}

request(options, callback);
}



