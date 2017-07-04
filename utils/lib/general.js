/*
  Name: General Utils Module for Triptable
  Developer: Ytzvan Mastino
  Date: Sept, 2016
*/
var keystone = require('keystone');
var extend = require('extend');
var Mixpanel = require('mixpanel');
var request = require('request');
var moment = require('moment');

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
  },

  sendReviewEmail : function (model) {
    if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'staging' ) {

    var fullname = model.name.first + " " + model.name.last;

    var date =  moment(model.date);
		var new_date = moment(date, "DD-MM-YYYY").add(2, 'days');
		var year = new_date.year();
		var month = new_date.month();
		var day = new_date.date();
	
	//	var dateToSend = new Date(year, month, day, hour, minute, 0);
    var dateToSend = year+"-"+month+"-"+day+" 19:00:00";
    let tourId = model.tour; 

    request.post({url:'https://mail.feeldock.com/mail/send', 
                form: {api_key:'53a68d85552d3a2158caeb8e7743a6ea',
                       source_hash:'42e7aaa88b48137a16a1acd04ed91125',
                       peoples : [{
                         email: model.email,
                         full_name: fullname,
                         user_id: model.user
                       }],
                       schedule: {
                         date: dateToSend,
                         tzone: "America/Panama"
                       },
                       feel_attributes: {tour_id:tourId,booking_id:model.friendlyId, people:model.people}               
            }}, 
                function(err,httpResponse,body){
                  console.log("err" + err);
                  console.log("httpResponse" + httpResponse);
                  console.log("body" + body);
                });
  } else {
    console.log("Email no enviado");
    return true;
    }
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
