var keystone = require('keystone');

exports.index = function(req, res) {
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.viewName = "My Booking";
  locals.data = {};


  
  view.on('init', function(next) {


    var param = req.query;
    var friendlyId = param.friendlyId.toLowerCase();
  
    console.log(param); 
       
    keystone.list('Enquiry').model.findOne({'friendlyId': friendlyId}).exec(function(err, result) { //Query Pais
      if (err || !result) {
        req.flash('error', "Not Found");
      }
      locals.data.booking = result;
    });
    return next();
    
  });

  view.render('user/myBooking');
}
