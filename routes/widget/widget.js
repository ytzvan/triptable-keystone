const keystone = require('keystone');
const async = require('async');
const Tour = keystone.list('Tour');

exports.init = function (req, res) {

  let view = new keystone.View(req, res);
  let locals = res.locals;
  let data = {};
  const Widget = keystone.list('Widget');
  let widgetId = req.params.widgetId;

  view.on('get', (next) =>{
    let q = Widget.model.findById(widgetId);

    q.exec( (err, result ) => {
      if (err || !result) {
        return res.status(404).render('errors/404');
      }
      
      locals.widgetData = result;
      data.widgetData = result;
      let tours = Tour.model
      .find({ 'city': data.widgetData.destination } )
      .limit(data.widgetData.resultLimit);
      tours.exec( (err, results ) => {
        if (err || !results) {
          return res.status(404).render('errors/404');
        }
        locals.tours = results;
        next();
      });

    });

  });
  view.render('widget/widget', {layout :'widget'});
}