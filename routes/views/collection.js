var keystone = require('keystone');
var async = require('async');
const Collection = keystone.list('Collection').model;
const Tours = keystone.list('Tour').model;


exports.getCollection = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  var cid = req.params.cid;
  locals.data.currency = req.session.currency.currency;

  view.on('init', function (next) {
    Collection.findOne({"slug":cid})
    .populate('tours')
    .exec(  (err, result) => {
      if (result == null) {
        return res.status(404).render('errors/404');
      }
      if (!err) {
        locals.data.collection = result;
        next();
      } else {
        console.log("console.log:", err);
        next();
      }
    });
  });

  view.render('collection/index');
}

exports.getAllCollections = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;

  locals.data.currency = req.session.currency.currency;

  view.on('init', function (next) {
   // const model = keystone.list('Collection').model;
    Collection.find()
    .where("state", "published")
    .populate('tours')
    .sort('-featured')
    .exec(function(err, result){
      if (result == null) {
        return res.status(404).render('errors/404');
      }
      if (!err) {
        locals.data.collections = result;
        next();
      } else {
        console.log("err", err);
        next();
      }
    })
  });

  view.render('collection/all');
}

exports.getLanding = function (req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.data.currency = req.session.currency.currency;
  const lid = req.params.lid;
  const Landing = keystone.list('Landing').model;

  view.on('init', function (next) {
    Landing.findOne({ "slug": lid})
    .where("state", "published")
    .populate({ 
      path: 'collections', options: { sort: { 'featured': -1 } },
      //Deep population
      populate: 
        { path: 'tours' }
    }) 
    .exec((err, result) => {
      if (result == null ) {
        return res.status(404).render('errors/404');  
      }
      if (!err) {
        locals.data.landing = result;
        locals.data.collections = result.collections;
        next();
      } else {
        console.log("console.log:", err);
        return res.status(404).render('errors/404');  
        //next();
      }
    });
  });
  view.render('collection/landing');

}