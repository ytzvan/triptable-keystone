var keystone = require('keystone');

exports.index = function(req, res) {
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.viewName = "about_us";
  view.render('static/index');
}

exports.about =function(req, res) {
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.viewName = "about";
  view.render('static/about');
} 

exports.faq = function (req, res){
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.viewName = "faq";
  view.render('static/faq');
}
exports.terms = function (req, res){
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.viewName = "terms";
  view.render('static/terms');
}