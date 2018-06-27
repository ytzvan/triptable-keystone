var keystone = require('keystone');
var async = require('async');
var User = keystone.list('User');
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'triptable', 
  api_key: '769197977994854', 
  api_secret: 'yDUEMqzo43Nbpual9yOaPiZnFso' 
});
var humanname = require('humanname');


exports.show = function(req, res) {   
    var view = new keystone.View(req, res);
    var locals = res.locals;
    view.on('init', function(next) {

    let userId = req.session.userId;

    User.model.findById(userId).populate('country').exec(function(err, result){
        if (err) {
          console.log(err);
          return res.status(404)
        } else {
          console.log("success");
          locals.data.profile = result;

          next();
        }
    });

   // next();
  });
  

  view.render('admin/profile', {layout:"v2-admin"});
}

exports.update = function(req, res) {   
  var view = new keystone.View(req, res);

  var name = humanname.parse(req.body.name);
  var nameObj = {};
  nameObj = { "first": name.firstName, "last": name.lastName};

  req.body.name = nameObj;
  console.log(nameObj);
  let userId = req.session.userId;
  var img;
  var body = req.body;
  var files = req.files;
  console.log(files);
  console.log(req.session.userId);
  if (files.avatar) {
    cloudinary.uploader.upload(files.avatar.path, function(result) { 
    body.image = result;  
    saveItem(body);
  });
} else {
  saveItem(body);
}

function saveItem(body){
  User.model.findOneAndUpdate({_id: req.session.userId}, body, {new: true}, function(err, model) {
    if (err) {
      console.log("error", err);
      locals.data.validationErrors = err.errors;
      req.flash('error', 'error msg');
      return res.redirect('/admin/profile');
    } else {
      req.flash('success', 'success msg');
      return res.redirect('/admin/profile');
    }
  });
}
  


//  view.render('admin/profile', {layout:"v2-admin"});
}

exports.addImage = function(req, res) {
  var view = new keystone.View(req, res);
  var files = req.files;
  var body = req.body;
  view.on('post', (next) => {
     cloudinary.uploader.upload(files.file.path, function(result) { 
      body.image = result;  
     // updateItem(body, req, res);
    });
    next();
  });

  view.render('admin/profile', {layout:"v2-admin"});
};

