export const site = {
  nombre: 'Habid Navarro',
  marca: 'Habid Navarro Bienes Raíces',
  tagline: 'Asesoría inmobiliaria honesta en Guadalajara y Zapopan',
  telefono: '+523921075791',
  telefonoDisplay: '+52 392 107 5791',
  whatsapp: '523921075791',
  whatsappMensaje: 'Hola Habid, me interesa Valle Imperial y quisiera más información.',
  email: 'habid.realestate@gmail.com',
  instagram: 'https://instagram.com/habid.realestate',
  instagramHandle: '@habid.realestate',
  facebook: '', // PENDIENTE: URL de la página de Facebook
  zona: 'Guadalajara y Zapopan, Jalisco',
  url: 'https://habidnavarro.com',
};

export const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/contacto', label: 'Contacto' },
];

export function waLink(mensaje: string = site.whatsappMensaje): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
