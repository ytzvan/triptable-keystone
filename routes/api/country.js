var async = require('async'),
keystone = require('keystone');

var Country = keystone.list('Country');


exports.list = function (req, res) {


  if (req.query.country){
    let country = req.query;
  }
   else {
    return res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
    //if (!item) return res.apiError('not found');
   }
  
};