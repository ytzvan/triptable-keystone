/*
  Name: General Utils Module for Triptable
  Developer: Ytzvan Mastino
  Date: Sept, 2016
*/
var keystone = require('keystone');
var extend = require('extend');
module.exports = {
  addPromoCodeToUser : function(user, req){
    var user = user;
    var referalCode = user.referalCode;
    referalCode = referalCode.toUpperCase();
    console.log(referalCode);
    keystone.list('PromoCode').model.findOne({ name: referalCode})
      .exec(function(err, result) {
          if(result == null){ //si hay resultado
             console.log("No match");
            }
          else {
            registerUserInPromoCode(result, user._id, req);
					  return true;
			    }
		    });
    return true;
  },


};
var registerUserInPromoCode = function (promoCodeModel, userId, req) {
    console.log("entro a register user in promo code" );

    var application = promoCodeModel;
    var users = promoCodeModel.users;
    console.log("pre-push", users);
    users.push(userId);
    console.log("post-push", users);
    var updater = application.getUpdateHandler(req);
    updater.process({users : users}, {
              //  flashErrors: true,
              //  fields: 'users',
                }, function (err) {
                if (err) {
                    console.log("fallo: " + err);
                    return true;
                } else {
                    console.log("Exito");
                    return true;
                }
                return true;
              });
     return true;
  };