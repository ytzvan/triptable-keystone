var keystone = require("keystone");
var Review = keystone.list("Review");

exports.new = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  var application = new Review.model();
  var updater = application.getUpdateHandler(req);

  updater.process(req.body, {
    flashErrors: true
  }, function (err) {
    if (err) {
      locals.validationErrors = err.errors;
      console.log(err);
    } else {
    //  locals.enquirySubmitted = true;
      console.log("succes", req.body)
      res.redirect(req.headers.referer);
    }
  });


//  view.render('attractions/single');
}