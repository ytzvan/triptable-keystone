var async = require('async'),
keystone = require('keystone');
var extend = require("extend");

var Country = keystone.list('Country');
var Tour = keystone.list("Tour");

exports.getCountry = function (req, res) {
  if (req.params.id) {
    let countryId = req.params.id;
		getCountryById(countryId).then(function(result) {
				res.apiResponse({ country: result });
			}, function(err) {
				return res.apiError("not found");
			});
	} else {
		return res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
	}
};

exports.getCountries = function (req, res) {
  getAllCountries().then(function (results) {
    res.apiResponse({ countries: results });
  }, function (err) {
      return res.apiError("not found");
  });
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
        Country.model.findById(countryId).exec(function (err, country) {
          if (err) {
            reject(err);
          } else {
            let result1 = country;
            getToursByCountryId(countryId).then(
              function (tours) {
       
               
                resolve(tours);
              }, function (err) {
                return res.apiError("not found");
              });
          }
        });
    });
} 

function getToursByCountryId(countryId) {
  return new Promise (
    function (resolve, reject) {
      Tour.model.find({country: countryId}).exec(function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    }
  );
}