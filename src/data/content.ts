import siteJson from '../../data/site.json';
import propertiesJson from '../../data/properties.json';

export interface Property {
  slug: string;
  name: string;
  status: string;
  status_key: 'venta' | 'apartada' | 'vendida';
  collection: 'disponible' | 'referencia';
  featured: boolean;
  type: string;
  bedrooms: string;
  bathrooms: string;
  price: string;
  area: string;
  location: string;
  municipality: string;
  state: string;
  summary: string;
  description: string[];
  amenities: string[];
  images: string[];
  map_query: string;
}

export const site = siteJson;
export const properties = propertiesJson as Property[];
export const featured: Property = properties.find((p) => p.featured) ?? properties[0];

export const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/contacto', label: 'Contacto' },
];

/**
 * Una propiedad vendida se muestra atenuada y sin enlaces: su ficha ya no es
 * navegable y al pulsar la tarjeta se abre el aviso de privacidad.
 */
export function isSold(p: Property): boolean {
  return p.status_key === 'vendida';
}

/** Propiedad activa a la que se redirige desde el aviso de propiedad vendida. */
export const availableProperty: Property | undefined = properties.find((p) => !isSold(p));

export function waLink(message: string = site.whatsapp_default_message): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function cardImage(p: Property): string {
  return p.images[0] ?? '/img/ui/no-photo.svg';
}
