module.exports = {
  newLead : function(obj){
    var name = obj["name.full"];
    if (!name){
      var name = "";
    };
    var message = "Hola "+ name +". \
    <br> Gracias por tu interés en ser un partner de Triptable. \
    <br>Somos una plataforma web y móvil que le permite a viajeros reservar tours y actividades online y ayuda a los proveedores de turismo \
    a aumentar sus reservas y ventas en línea. <br>\
    Actualmente trabajamos con los mejores proveedores de turismo de Latinoamérica para ofrecerle a nuestros usuarios la mejor experiencia posible.<br>\
    Publicar en Triptable es gratis, sin embargo requerimos verificar unos datos primero. <br>\
    El primer paso es completar el formulario de datos de tour operador: http://bit.ly/triptableTO, luego de completar el formulario de datos, puedes enviarnos la información de sus tours a través del siguiente enlace: http://bit.ly/triptableAdd. <br>Luego de que recibimos el formulario completo, procedemos a confeccionar un contrato de colaboración basado en los datos que nos envió. El proceso termina cuando se firme el contrato y nos envíe la información de sus tours. <br> \
     <br>\
    Saludos, <br><br>Ytzvan Mastino<br>Co-founder & CEO.";
    console.log(message);
    return message;
  },

  newPartner : function (obj){
    var name = obj["name.full"];
    var message = "Nuevo partner registrado. <br>Datos: <br>Nombre: "+ name +" .<br> Email: "+obj.email+"<br>Phone: " +obj.phone + "<br>Company: "+obj.company+"<br>";
    return message; 
  },

  newUserRegister : function(obj) {
    var message = 'Hola, un nuevo usuario se ha registrado en triptable. <br> Nombre: '+ obj.name.full +'<br>email: '+ obj.email;
    return message;
  }
}