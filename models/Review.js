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
        return true;
			});
var Review = new keystone.List('Review', {
	//autokey: { from: 'name', path: 'key', unique: true }
	autokey: { path: 'slug', from: 'author', unique: true }
});

Review.add({
	message: { type: Types.Textarea },
	author: { type: Types.Relationship, ref: 'User', index: true },
	name: {type: String},
	email: {type: String},
	score: {type: Types.Number},
	tour: { type: Types.Relationship, ref: 'Tour', index: true },
	createdAt: { type: Date, default: Date.now, noedit: true },
});

/*Review.schema.post('save', function() {
  var score = this.score;
	var tourId = this.tour;
	var count = Number(0);
	var finalScore;
	var q = keystone.list('Review').model.find({"tour": tourId});
	q.exec(function(err, Reviews){
			var Reviews = Reviews;
			for(var i=0;i<Reviews.length;i++){
				var reviewScore = Number(Reviews[i].score);
				count = count + reviewScore; 
			} // end for
			var nOfReviews = Reviews.length; 
			finalScore = count / nOfReviews;
			finalScore = finalScore.toFixed(2);
			keystone.list('Tour').model.update({"_id": tourId},{ $set: { nOfStars: finalScore, nOfReviews: nOfReviews } })
				.exec(function(err,result){
					console.log(err);
					console.log(result);
				return true;
			});
	}); // end query	
}); */

Review.schema.post('remove', function(){
	var score = this.score;
	var tourId = this.tour;
	var count = Number(0);
	var finalScore;
	var q = keystone.list('Review').model.find({"tour": tourId});
	q.exec(function(err, Reviews){
			if (Reviews) {
				var Reviews = Reviews;
				for(var i=0;i<Reviews.length;i++){
					var reviewScore = Number(Reviews[i].score);
					count = count + reviewScore;
				} // end for
				var nOfReviews = Reviews.length; 
				finalScore = count / nOfReviews;
				finalScore = finalScore.toFixed(2);
				keystone.list('Tour').model.update({"_id": tourId},{ $set: { nOfStars: finalScore, nOfReviews: nOfReviews } })
					.exec(function(err,result){
						console.log(err);
						console.log(result);
					return true;
				});
			} else {
				var nOfStars = Number(4.5);
				var nOfReviews = Number(0);
				keystone.list('Tour').model.update({"_id": tourId},{ $set: { nOfStars: nOfStars, nOfReviews: nOfReviews } })
					.exec(function(err,result){
						console.log(err);
						console.log(result);
					return true;
				});
			}
	});

	
});

Review.relationship({ ref: 'Tour', path: 'reviews' });
Review.defaultColumns = 'author, score|20%, message|20%';
Review.register();
