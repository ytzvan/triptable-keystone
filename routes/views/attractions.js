var keystone = require('keystone');
var async = require('async');

exports.index = function(req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.meta = {};
  var url = req.url;
	locals.meta.url = "https://www.triptable.com"+url;
  var attrId;
  locals.data = {};

  view.on('init', function(next) {
  keystone.list('Attraction').model.find()
  .exec(function(err, attractions){
    if (err || !attractions) {
				return res.status(404);
			}
      locals.data.attractions = attractions;
      next();
      });
    });
  	view.render('attractions/index');
};

exports.single = function(req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.data = {};
   view.on('init', function(next) {
    keystone.list('Attraction').model.findOne({slug: req.params.slug})
      .exec(function(err, attraction){
        if (err || !attraction) {
				  return res.status(404);
			  }
        locals.data.attraction = attraction;
        console.log("attraction._id", attraction._id)
        var q = keystone.list('Tour').model.find().where('attraction', attraction._id);
        q.exec(function(err, tours){
          if (err || !tours) {
				    return res.status(404);
			    }
          locals.data.tours = tours;
        next();
        });
    });
  });


  view.render('attractions/single');
};