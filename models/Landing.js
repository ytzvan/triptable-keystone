var keystone = require('keystone');
var Types = keystone.Field.Types;

const Landing = new keystone.List('Landing', {
  autokey: { path: 'slug', from: 'name', unique: true, index: true }
});

Landing.add({
  name: { type: String, required: true, initial: true },
  title: {
    en: { type: String },
    es: { type: String }
  },
  state: {
    type: Types.Select,
    options: "draft, published, archived, child",
    default: "draft",
    index: true
  },
  meta_title: {
    en: { type: String,  },
    es: { type: String, }
  },
  meta_description: {
    en: { type: String, },
    es: { type: String,  }
  },
  meta_keywords: {
    en: { type: String,  },
    es: { type: String, }
  },
  description: {
    en: { type: Types.Html, wysiwyg: true, height: 400, label: 'Inglés' },
    es: { type: Types.Html, wysiwyg: true, height: 400, label: 'Español' }
  },
  image: { type: Types.CloudinaryImage },
  featured: { type: Types.Boolean, default: false },
  collections: {
    type: Types.Relationship, ref: 'Collection', many: true,
    filters: { state: 'published' }
  },
  country: { type: Types.Relationship, ref: 'Country' },
  province: { type: Types.Relationship, ref: 'Province', filters: { country: ':country' } },
  city: { type: Types.Relationship, ref: 'City', filters: { province: ':province' } },
});

Landing.relationship({ ref: 'Collection', path: 'collections', refPath: 'collections' });
Landing.defaultColumns = 'name, title.es, title.en';
Landing.register();