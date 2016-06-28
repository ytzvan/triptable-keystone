var keystone = require('keystone');
var async = require('async');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.meta = {};
  var url = req.url;
	locals.meta.url = "https://www.triptableapp.com"+url;
  var attrId;
  locals.data = {};
   view.on('init', function(next) {

		keystone.list('Attraction').model.findOne({
			slug: req.params.slug
		}).exec(function(err, results) { //Query attractions
			if (err || !results) {
				return res.status(404);
			}
      locals.meta.title = "Reserva tours y actividades en " + results.name + " - Triptable";
			locals.meta.keywords = "atracciones, como llegar, visitar, " + results.name;
			locals.meta.description = "Reserva tours y excursiones a " + results.name + " con Triptable. Descubre como Como llegar o visitar " + results.name + ".";
			locals.meta.ogTitle = locals.meta.title;
			locals.meta.ogType = "website";
			locals.meta.ogDescription = locals.meta.description;
			var img = results.image;
			if (img) {
				locals.meta.image = "https://res.cloudinary.com/triptable/image/upload/c_fill,h_400,w_600,q_75/v"+img.version+"/"+img.public_id+"."+img.format;
			}
			locals.data.attraction = results;
      attrId = results._id;
			return next();

		  });

	});

  view.on('init', function(next) {
  keystone.list('Tour').model.find().where({'attraction': attrId})
  .exec(function(err, tours){
    if (err || !tours) {
				return res.status(404);
			}
      locals.data.tours = tours;
      return next();
      });
    });


  	view.render('attractions');
}