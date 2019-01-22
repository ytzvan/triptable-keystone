var keystone = require('keystone');
var async = require('async');
var QueryUtils = require('../../utils').QueryUtils;

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Init locals
  locals.section = 'destination';

  var category = req.query.categoria;

  locals.data = {
    provinces: [],
    tours: [],
    filters: [],
    categories: [],
    cities: []
  };

  locals.cities = [];
  locals.meta = {};
  var url = req.url;
  locals.meta.url = "https://www.triptable.com" + url;
  query = {
    'country': req.params.country,
    'destination': req.params.city
  };
  locals.data.country = req.params.country;
  locals.data.city = "";
 // console.log(getCountryFromName(locals.data.country));
	/*view.on('init', function(next) {

			if (req.query.categoria) {
				keystone.list('PostCategory').model.findOne({ slug: category }).exec(function(err, result) {
					locals.data.filters = result;
					next(err);
				});
			} else {
				next();
			}

		});*/

  view.on('init', function (next) {

    var Tour = keystone.list('Tour');
    var Country = keystone.list('Country');
    var City = keystone.list('City');

   keystone.list("Country")
			.model.find()
			.exec(function(country) {
				console.log("countrymodel", country);
				return country;
		});

    Tour.model.find()
     // .limit(100)
      .where({})
      .exec()
      .then(function (tours) { //first promise fulfilled
        //return another async promise
      //  console.log(tours);
        next();
      }, function (err) { //first promise rejected
        throw err;
        next();
      }).then(function (result) { //second promise fulfilled
        //do something with final results
        console.log(results);
        next();
      }, function (err) { //something happened
        //catch the error, it can be thrown by any promise in the chain
        console.log(err);
        next();
      });
  });
  
  view.render('search/country');

}

