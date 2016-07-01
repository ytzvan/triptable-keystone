var keystone = require('keystone');
var async = require('async');
var Enquiry = keystone.list('Enquiry');

exports.index = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    locals.data = {
      bookings : [],
      operator : req.user,
      bookingId : req.params.id
	  };
    var operator = req.user._id;
    var bookingId = req.params.id;
    console.log(bookingId);

    view.on('init', function(next) {
				keystone.list('Enquiry').model.findOne({friendlyId: bookingId}).sort('-createdAt').exec(function(err, result) {
          if(result == null){ //si hay resultado
             return false;
            }
          else {
            locals.data.booking = result;
            getTourInfo(result.tour, next);
			    }
		    });

		});
    function getTourInfo(tourId, next) {
      keystone.list('Tour').model.findOne({_id: tourId}).exec(function(err, result) {
          if(result == null){ //si hay resultado
            next();
            }
          else {
            locals.data.tour = result;
            next();
			    }
		    });
    };
    view.render('admin/booking');
};

exports.update = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    if (req.body.action === 'decline') {
      req.body.bookingStatus = 2;
    } else {
      req.body.bookingStatus = 1;
    };
    view.on('post', function(next) {

      keystone.list('Enquiry').model.findOne({friendlyId: req.params.id}).exec(function(err, result) {
       if (err){
          var message = err;
          req.flash('error', message);
          return res.redirect(req.get('referer'));
       };
       if(result == null){ //si no hay resultado
              var message = "Sin resultados";
              req.flash('error', message);
              return res.redirect(req.get('referer'));
            }
            else {
              console.log("estado previo", result.bookingStatus);
              if (result.bookingStatus != 0) {
                var message = "Esta reserva ya ha sido aceptada o declinada";
                console.log(message);
                req.flash('error', message);
                return res.redirect(req.get('referer'));
              }
              var application = result;
              var updater = application.getUpdateHandler(req);
              updater.process(req.body, {
                flashErrors: true,
                fields: 'bookingStatus',
                }, function (err) {
                if (err) {
                    var message = err;
                    req.flash('error', message);
                    return res.redirect(req.get('referer'));
                } else {
                    if (req.body.bookingStatus == 1) {
                      var action = "confirmada";
                    } else {
                      var action = "declinada"
                    }
                    var message = "La reserva ha sido " + action + " con éxito";
                    req.flash('success', message);
                    return res.redirect(req.get('referer'));
                }
                next();
              });

            }
		     });
     });
  view.render('admin/booking');
};

