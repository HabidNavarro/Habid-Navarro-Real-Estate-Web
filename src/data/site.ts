export const site = {
  nombre: 'Habid Navarro',
  marca: 'Habid Navarro Bienes Raíces',
  tagline: 'Asesoría inmobiliaria honesta en Jalisco',
  telefono: '+523921075791',
  telefonoDisplay: '+52 392 107 5791',
  whatsapp: '523921075791',
  whatsappMensaje: 'Hola Habid, me interesa la casa en Ocotlán y quisiera más información.',
  email: 'habid.realestate@gmail.com',
  instagram: 'https://instagram.com/habid.realestate',
  instagramHandle: '@habid.realestate',
  facebook: '', // PENDIENTE: URL de la página de Facebook
  zona: 'Jalisco',
  url: 'https://habidnavarro.com',
};

export const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/contacto', label: 'Contacto' },
  // 'Sobre mí' (/sobre-mi) oculta temporalmente: la página existe pero no se enlaza
  // hasta que haya foto de Habid. Re-agregar aquí para volver a mostrarla.
];

export function waLink(mensaje: string = site.whatsappMensaje): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
