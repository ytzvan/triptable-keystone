var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');

exports.init = function(req, res) {
    var view = new keystone.View(req, res);
    var locals = res.locals;
    locals.data = {
        bookings : [],
        results : []
    };
    var q = keystone.list('Enquiry').model.find().sort('createdAt');
        q.exec(function(err, bookings) {
            if(!bookings){ //si hay resultado
                return false;
            }
            else {
                locals.data.bookings = bookings; 
                getBalance(view, locals);
                
            }
        });
             
},

 getBalance = function(view, locals) {
    Enquiry.model.aggregate([
        { $match: {
            bookingStatus: "1"
        }},
        
     //   { $unwind: "$records" },
        { 
            $project: {
                _id: "$_id",
                bookingRevenue: true,
                bookingTotalPrice: true,
                date : true,
                year: {$year: "$createdAt"},
                month: {$month: "$createdAt"},
                day: { $dayOfMonth: "$createdAt" }
               // stringdate : {$dateToString: "$createdAt"},
            }
        },
        {
            $group : {
               // _id: {month:"$month", stringdate: "$stringdate"},
                _id : null,
                count: {$sum: 1},
                total: { $sum: "$bookingRevenue"  }
            },  
        },
        { 
            $sort: {
                '_id.month': 1, 
                /*'_id.year': 1, 
                '_id.month': 1, 
                '_id.day': 1*/
            } 
        }
       
        
    ], function (err, result) {
        if (err) {
            console.log(err);
        }
        console.log(result);
        locals.data.results = result;
        view.render('dashboard/index'); 
        
    });
}

