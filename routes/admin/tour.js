var keystone = require('keystone');
var async = require('async');
var Enquiry = keystone.list('Enquiry');
var Tour = keystone.list('Tour');
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'triptable', 
  api_key: '769197977994854', 
  api_secret: 'yDUEMqzo43Nbpual9yOaPiZnFso' 
});

exports.add = function(req, res) {   
  var view = new keystone.View(req, res);
 
  view.on('init', function(next) {

    var locals = res.locals;
      locals.data = {
      bookings : [],
      operator : req.user,
      bookingId : req.params.id
    };
    locals.data.minPerson = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    locals.data.maxPerson = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    next();
  });
  

  view.on('post', function(next) {
    let locals = res.locals;

    var body = req.body;
    var files = req.files;
    console.log(body);
   // Array of days.
   
    var newPost = new Tour.model({
      name: body.name,
      duration: body.duration,
      minPerson: body.minPerson,
      maxPerson: body.maxPerson,
      owner: req.user.id,
      state: 'draft',
      description: { short :  body.description_short, extended: body.description_extended},
      tourType : body.tourType,
      videoId : body.youtube,
      hotelPickup: body.hotelPickup,
      transportation: body.transportation,
      maritimeTransportation: body.maritimeTransportation,
      food:body.food,
      drinks: body.drinks,
      snacks: body.snacks,
      insurance: body.insurance,
      skipDays: body.skipDays,
      departureTime: body.departureTime,
      arrivalTime: body.arrivalTime,
      country: req.user.country,
      daysDisabled: body.daysDisabled
    });
    if (files.heroImage) {
        cloudinary.uploader.upload(files.heroImage.path, function(result) { 
        newPost.heroImage = result;  
        saveItem(newPost);
      });
    } else {
      saveItem(newPost);
    }
    
    function saveItem(newPost){
      newPost.save(function(err, result) {
        if(err){
          locals.data.validationErrors = err.errors;
          console.log("Data",  err.errors);
          next();
        } else{
          res.redirect('/admin/tour/list');
        }
      });
    }
    
    
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
    });
    try {
    Tour.model.find({owner: req.user.id, state:'draft'})
    .exec(function(err, results) {
      if (err) {
        return res.status(404).render("errors/404");
      }
      locals.data.results_draft = results;
      view.render('admin/tour/list', { layout: "v2-admin" });
    });
    } catch (e) {
      return res.status(404).render("errors/404");
    }
  
};

exports.addImages = function(req, res) {
  var view = new keystone.View(req, res);
  view.on('post', (next) => {
    console.log(req.files);
    // cloudinary.uploader.upload(files.heroImage.path, function(result) { 
    //   newPost.heroImage = result;  
    //   saveItem(newPost);
    // });
    next();
  });
  view.render('admin/tour/new', {layout:"v2-admin"});
};

exports.delete = function(req, res) {
  var locals = res.locals;
    locals.data = {
    bookings : [],
    operator : req.user,
    bookingId : req.params.id
  };
  var tourId = req.params['id'];
  var view = new keystone.View(req, res);
   Tour.model.findByIdAndRemove(tourId).exec(function(err, result){
    if (err) {
      console.log(err);
      res.redirect('/admin/tour/list');
    } else {
      console.log("success");
      res.redirect('/admin/tour/list');
    }
  });
  
}

exports.edit = function(req, res) {
  var locals = res.locals;
    locals.data = {
    bookings : [],
    operator : req.user,
    bookingId : req.params.id
  };

  var tourId = req.params['id'];
  var view = new keystone.View(req, res);

  view.on('init', (next) => {
    var success = req.query.success;
    if (success) {
      locals.data.success = true;
    }
    Tour.model.findById(tourId).exec(function(err, result){
      if (err) {
        console.log(err);
        next();
      } else {
        locals.data.tour = result;
        next();
      }
    });
  });

  view.on('post', (next) => {
    var files = req.files;
    var id = req.params['id'];
    var body = req.body;

    function checkAmenity(amenity) {
      if(amenity in body){
        return true;
      } else {
        return false;
      }
    }

    req.body.hotelPickup = checkAmenity("hotelPickup");
    req.body.transportation = checkAmenity("transportation");
    req.body.maritimeTransportation = checkAmenity("maritimeTransportation");
    req.body.food = checkAmenity("food");
    req.body.snacks = checkAmenity("snacks");
    req.body.drinks = checkAmenity("drinks");
    req.body.insurance = checkAmenity("insurance");

    if (files.heroImage) {
      cloudinary.uploader.upload(files.heroImage.path, function(result) { 
      req.body.heroImage = result;  
      Tour.model.findOneAndUpdate({_id: id}, req.body, {new: true}, function(err, model) {
        if (err) {
          console.log("error", err);
          locals.data.validationErrors = err.errors;
          next();
        } else {
          req.flash('success', 'success msg');
          return res.redirect('/admin/tour/edit/'+model.tourId);
        }
       });

      });
      } else {
        Tour.model.findOneAndUpdate({_id: id}, req.body, {new: true}, function(err, model) {
          if (err) {
            console.log("error", err);
            locals.data.validationErrors = err.errors;
            next();
          } else {
            req.flash('success', 'success msg');
            return res.redirect('/admin/tour/edit/'+model.tourId);
          }
        });
      }
    });
  view.render('admin/tour/edit', {layout:"v2-admin"});
}