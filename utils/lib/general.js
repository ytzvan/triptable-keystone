/*
  Name: General Utils Module for Triptable
  Developer: Ytzvan Mastino
  Date: Sept, 2016
*/
var keystone = require('keystone');
var extend = require('extend');
var Mixpanel = require('mixpanel');

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
            registerUserInPromoCode(result, user._id, req); //Reference the user in promocode
            addCreditFromPromoCode(result, user, req); //Add credit to user account and reference promocode in User
			    }
		    });
    return true;
  },

  addEventToMixPanel : function (eventName) {
    // initialize mixpanel client configured to communicate over https
    var mixpanel = Mixpanel.init('e61a9c6f2bbe99a8395b4e5fc417e275', {
        protocol: 'https'
    });
    mixpanel.track(eventName);
    return true;
  }

};
var registerUserInPromoCode = function (promoCodeModel, userId, req) {
    console.log("entro a register user in promo code" );
    var application = promoCodeModel;
    var users = promoCodeModel.users;
    users.push(userId);
    var updater = application.getUpdateHandler(req);
    updater.process({users : users}, {
              //  flashErrors: true,
                fields: 'users',
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

var addCreditFromPromoCode = function (promoCodeModel, userModel, req) {
    console.log("user model "+userModel);
    var application = userModel;
    var credit = userModel.credit;
    console.log("pre credit" + credit);
    credit = credit + promoCodeModel.amount;
    console.log("post credit" + credit)

    var updater = application.getUpdateHandler(req);
    updater.process({credit : credit,
                    promoCode: promoCodeModel._id}, {
              //  flashErrors: true,
                fields: 'credit, promoCode',
                }, function (err) {
                if (err) {
                    console.log(err);
                    return true;
                } else {
                    console.log("Exito");
                    return true;
                }
                return true;
              });
     return true;

};
