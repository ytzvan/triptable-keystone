var keystone = require('keystone');
var Types = keystone.Field.Types;

var homeGallery = new keystone.List('homeGallery');

homeGallery.add({
  image: { type: Types.CloudinaryImage },
  description : {type: String},
  url : {type : String},
  verticalPosition: {type: Types.Number, default: 50}
});

homeGallery.register();