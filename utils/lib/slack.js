//var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
var MY_SLACK_WEBHOOK_URL = "https://triptable.slack.com/services/hooks/incoming-webhook?token=ZjEoquN4sO2MD9aKolISXGDG"
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
	
module.exports = {
    sendEnquiryToSlack: function(bookingModel){
       
    var model = bookingModel;
    var fullName = model.name.first + ' ' + model.name.last;
    slack.send({
        channel: process.env.SLACK_CHANNEL,
        icon_url: 'http://example.com/my-icon.png',
        text: 'Nueva Reserva 🔥🙌: '+ fullName+ '. Personas: '+ model.people + '. Email: '+model.email+ '. Telefono: ' + model.phone +  '. Tour: '+model.tourName+ '. Fecha: '+model.datePretty+'. Hotel: '+model.hotel+'. Precio: $'+model.bookingTotalPrice+'. ID: '+model.friendlyId,
        username: 'triptable-bot'
});

        slack.onError = function (err) {
                console.log('API error:', err);
                };
            }

};

	

