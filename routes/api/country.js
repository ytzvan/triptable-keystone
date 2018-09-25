var async = require('async'),
keystone = require('keystone');
var extend = require("extend");

var Country = keystone.list('Country');
var Tour = keystone.list("Tour");
var City = keystone.list("City");

exports.getCountry = function (req, res) {
  if (req.params.id) {
    let countryId = req.params.id;
		getCountryById(countryId).then(function(result) {
				res.apiResponse({ country: result });
			}, function(err) {
       return res.sendStatus(404);
			});
	} else {
		return res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
	}
};

exports.getCountries = function (req, res) {
  getAllCountries().then(function (results) {
    res.apiResponse({ countries: results });
  }, function (err) {
    return res.sendStatus(404);
  });
}

exports.getLocalHome = function(req, res, next){
  let cities;
  let tours;
  if (req.params.id) {
    let countryId = req.params.id;
    getCitiesFromCountryId(countryId).then(function(cities) {
      cities = cities;
      getToursByCountryId(countryId).then(function(tours) {
        tours = tours;
        res.apiResponse({ cities: cities, tours : tours });
      }).catch(function XXX() {
        return res.sendStatus(404);
      });
      
    
     //   res.apiResponse({ tours: tours });

    }).catch (function XXX() {
      return res.sendStatus(404);
     });
  } else {
    return res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
  }
  
} 

function getAllCountries(){
  return new Promise(
    function (resolve, reject) {
      Country.model.find().populate('tours').exec(function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
}

function getCountryById(countryId) {
    return new Promise(
      function (resolve, reject) {
        Country.model.findById(countryId).populate('city tours').exec(function (err, country) {
          if (err) {
            reject(err);
          } else {
            let countryModel = country;
            resolve(countryModel);
          }
        });
    });
} 

function getToursByCountryId(countryId) {
  return new Promise (
    function (resolve, reject) {
      Tour.model.find({country: countryId}).limit(10).sort('-featured').exec(function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    }
  );
}


function getCitiesFromCountryId(countryId) {
  return new Promise(
    function (resolve, reject) {
      City.model.find({ country: countryId}).sort('-featured').limit(10).populate('tours').exec(function(err, cities) {
        if (err) {
          reject(err);
        } else {
          resolve(cities);
        }
      });
    });
}

function getToursFromCityId(cityId){
  return new Promise (
    function (resolve, reject) {
      Tour.model.find({city : cityId}).limit(10).exec(function(err, tours){
        if (err) {
          reject(err);
        } else {
          resolve(tours);
        }
      })
      
    }
  );
}


function getHome(countryId) { //Async func 
  return new Promise(
    function (resolve, reject) {
      var query = keystone.list('Tour')
        .paginate({
          page: req.query.page || 1,
          perPage: 9,
          maxPages: 1
        })
        .where('country', countryId)
        .where('state', 'published')
        .where('featured', true)
        .sort('-publishedDate')
        .populate('province categories city');

      query.exec(function (err, results) {
        if (!err) {
         // results.currency = req.session.currency.currency;
          resolve(results);
        } else {
          reject(err);
        }
      });
    });
};