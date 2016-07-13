module.exports = {
  newLead : function(obj){
    console.log("entyro a new lead");
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
    El primer paso para convertirte en proveedor es crear una cuenta en: http://triptableapp.com/signup. <br> \
    Pronto te estaré contactando para que me cuentes más acerca de tu negocio y mostrarte como puedes hacerlo crecer con Triptable. <br>\
    Saludos, <br>Ytzvan Mastino<br>Co-founder & CEO.";
    console.log(message);
    return message;
  },

  newUserRegister : function(obj) {
    var message = 'Hola, un nuevo usuario se ha registrado en triptable. <br> Nombre: '+ obj.name.full +'<br>email: '+ obj.email;
    return message;
  }
}