var keystone = require('keystone');

exports.index = function(req, res) {
  var view = new keystone.View(req, res);
  view.render('static/index');
}

exports.about =function(req, res) {
  var view = new keystone.View(req, res);
  view.render('static/about');
} 