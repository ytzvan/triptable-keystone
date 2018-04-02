var keystone = require('keystone');

exports = module.exports = function(req, res) {
  var locals = res.locals;
  locals.meta = {};
  locals.meta.canonical = req.url;
  var view = new keystone.View(req, res);
   view.render('static/how_it_works');
}