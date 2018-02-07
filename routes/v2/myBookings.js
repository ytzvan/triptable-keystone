var keystone = require('keystone');

exports.index = function(req, res) {
  var locals = res.locals;
  var view = new keystone.View(req, res);
  locals.viewName = "My Booking";
  locals.data = {};
    view.on('init', function(next) {
      next(); 
    });

  view.render('user/myBooking');
}


exports.getInvoice = function(req, res) {
  var locals = res.locals;
  var view = new keystone.View(req, res);



  view.on('post', function(next) {    
    var body = req.body;
    var bookingId = body.bookingId.toLowerCase();
    var bookingEmail = body.email;
    console.log(bookingId);


    keystone.list('Enquiry').model.findOne({'friendlyId': bookingId}).exec(function(err, result) { //Query Pais
      console.log("result", result);
      if (!result ) {
        req.flash("error", "Booking ID Not Found" );
        next();
      } else {
        var email = result.email;
        if (bookingEmail == email) {
          locals.data.booking = result;
          console.log("result",result);
          return res.redirect("/invoice/"+result._id);
        } else {
          req.flash("error", "Booking ID o e-mail inválido" );
          next();
        }
        
      }
    });
    
  });
  view.render('user/myBooking');
}
