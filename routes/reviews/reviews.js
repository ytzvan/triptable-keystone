var keystone = require("keystone");
var Review = keystone.list("Review");


exports.new = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  var application = new Review.model();
  var updater = application.getUpdateHandler(req);

  let update = updater.process(req.body, {
    flashErrors: true
  }, function (err) {
    if (err) {
      locals.validationErrors = err.errors;
      return res.redirect(req.headers.referer);;
    } else {
      return res.redirect(req.headers.referer + "#listing-reviews");
    }
  });


//  view.render('attractions/single');
}
