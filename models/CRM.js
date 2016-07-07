var keystone = require('keystone');
var Types = keystone.Field.Types;
var Mailgun = require('machinepack-mailgun');
var CRM = new keystone.List('CRM', {
	nocreate: true,
});

CRM.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
  company: { type: String, },
	enquiryType: { type: Types.Select, options: [
		{ value: 'Tour Operador', label: "Tour Operador" },
		{ value: 'Guia', label: "Guía Independiente" },
		{ value: 'Agencia de Viajes', label: "Agencia de Viajes" },
		{ value: 'Hotel', label: "Hotel" },
		{ value: 'Transporte', label: "Servicios de Transporte" },
		{ value: 'Insider', label: "Quiero enseñarle mi ciudad a viajeros" },
	], required: false },
	message: { type: String, required: false },
  status: { type: Types.Select, options: [
		{ value: '0', label: "Lead" },
		{ value: '1', label: "Se envió el formulario" },
		{ value: '2', label: "Se envió el contrato" },
		{ value: '3', label: "Se recibieron todos los documentos" },
		{ value: '4', label: "Venta Cerrada" },
    { value: '5', label: "No está interesado" },
	], required: false, default: 0 },
  createdAt: { type: Date, default: Date.now, noedit: true },
});

CRM.track = true;
CRM.defaultSort = '-createdAt';
CRM.defaultColumns = 'name, email, company, phone, status';
CRM.register();