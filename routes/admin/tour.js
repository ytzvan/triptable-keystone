var keystone = require('keystone');
var async = require('async');
var Enquiry = keystone.list('Enquiry');
var Tour = keystone.list('Tour');

exports.add = function(req, res) {   
  var view = new keystone.View(req, res);
 
  view.on('init', function(next) {

    var locals = res.locals;
      locals.data = {
      bookings : [],
      operator : req.user,
      bookingId : req.params.id
    };
    locals.data.minPerson = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
    locals.data.maxPerson = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
    next();
  });
  

  view.on('post', function(next) {
    var body = req.body;
      var newPost = new Tour.model({
          name: body.name,
          duration: body.duration,
          minPerson: body.minPerson,
          maxPerson: body.maxPerson,
          owner: req.user.id,
          state: 'draft',
          description: { short :  body.description_short, extended: body.description_extended},
          tourType : body.tourType
      });
    
    
    newPost.save(function(err, result) {
        // post has been saved	
        if(err){
          console.log(err);
        } else{
          res.redirect('/admin/tour/list');
        }
    });
   // next();
    
  });
  view.render('admin/tour/new', {layout:"v2-admin"});
};

exports.list = function(req, res) {
   var locals = res.locals;
      locals.data = {
      bookings : [],
      operator : req.user,
      bookingId : req.params.id
    };

  var view = new keystone.View(req, res);
    Tour.model.find({owner: req.user.id, state:'published'})
    .exec(function(err, results) {
      locals.data.results_active = results;
      console.log(results);
    });
    Tour.model.find({owner: req.user.id, state:'draft'})
    .exec(function(err, results) {
      locals.data.results_draft = results;
    });
  view.render('admin/tour/list', {layout:"v2-admin"});
};

exports.edit = function(req, res) {
  var locals = res.locals;
    locals.data = {
    bookings : [],
    operator : req.user,
    bookingId : req.params.id
  };
  var view = new keystone.View(req, res);
}