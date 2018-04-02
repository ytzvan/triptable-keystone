var keystone = require('keystone');

exports.index = function(req, res) {
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.meta = {};
  locals.meta.canonical = req.url;
  locals.viewName = "about_us";
  view.render('static/index');
}

exports.about =function(req, res) {
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.meta = {};
  locals.meta.canonical = req.url;
  locals.viewName = "about";
  view.render('static/about');
} 

exports.faq = function (req, res){
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.meta = {};
  locals.meta.canonical = req.url;
  locals.viewName = "faq";
  view.render('static/faq');
}
exports.terms = function (req, res){
  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.meta = {};
  locals.meta.canonical = req.url;
  console.log(req.url);
  locals.viewName = "terms";
  view.render('static/terms');
}