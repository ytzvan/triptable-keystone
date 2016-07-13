var messagebird = require('messagebird')('live_d0CiSToNU18haOdnsJCLy3uoe');

module.exports = {
  sendSms: function(obj){
   //ar number = obj.number;
    console.log(obj);
    var cellphone = obj.operatorCellphone;
    var bookingID = obj.friendlyId;
    var params = {
        'originator': '+50768080024',
        'recipients': [
          cellphone
        ],
        'body': 'Tienes una nueva solicitud de reserva en Triptable. Por favor visita https://triptable.com/admin para aceptarla o declinarla. Booking ID: '+ bookingID +'.'
    };

    messagebird.messages.create(params, function (err, response) {
      if (err) {
        console.log(err);
        return false;
      }
      console.log(response);
      return true;
    });
  }
};
