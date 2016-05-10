var keystone = require('keystone');
var Types = keystone.Field.Types;
var Tour = require('./Tour');
var tour = keystone.list('Tour');
/**
 * Reviews Model
 * ==================
 */
var t = keystone.list('Tour').model.find()
    //.limit('3')
			t.exec(function(err, results) {
      //  return console.log(results);
        return true;
			});
var Review = new keystone.List('Review', {
	//autokey: { from: 'name', path: 'key', unique: true }
	autokey: { path: 'slug', from: 'author', unique: true }
});

Review.add({
	message: { type: Types.Textarea },
	author: { type: Types.Relationship, ref: 'User', index: true },
	score: {type: Types.Number},
	tour: { type: Types.Relationship, ref: 'Tour', index: true },
});

Review.relationship({ ref: 'Tour', path: 'reviews' });
Review.defaultColumns = 'author, score|20%, message|20%';
Review.schema.post('save', function() {
  var reviewId = this._id;
  var tourId = this.tour;
  console.log("tour", tourId);
  var body = {}
  body = {
    'reviews' : tourId
  }
  var update = tour.model.findByIdAndUpdate(tourId, {$push: {nOfReviews: reviewId}},{safe: true, upsert: true});
  update.exec(function(err, results) {
      console.log(err);
      console.log(results);
  });
	return true;
});
Review.register();
