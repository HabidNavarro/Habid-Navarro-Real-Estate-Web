export interface Propiedad {
  slug: string;
  nombre: string;
  estado: 'En venta' | 'Apartado' | 'Vendido';
  destacada: boolean;
  tipo: string;
  precio: string;
  superficie: string;
  ubicacion: string;
  municipio: string;
  entidad: string;
  amenidades: string[];
  galeria: string[];
  resumen: string;
  descripcion: string[];
  mapaEmbed: string;
}

export const propiedades: Propiedad[] = [
  {
    slug: 'valle-imperial',
    nombre: 'Valle Imperial',
    estado: 'En venta',
    destacada: true,
    tipo: '****',
    precio: '****',
    superficie: '****',
    ubicacion: '****',
    municipio: 'Zapopan',
    entidad: 'Jalisco',
    amenidades: ['Cinemex', 'Alberca', 'Salón de eventos', 'Áreas verdes'],
    galeria: [
      '/img/placeholder/valle-1.jpg',
      '/img/placeholder/valle-2.jpg',
      '/img/placeholder/valle-3.jpg',
      '/img/placeholder/valle-4.jpg',
    ],
    resumen: 'Último terreno a la venta en una comunidad privada con amenidades de primer nivel en Zapopan.',
    descripcion: [
      'Valle Imperial es una comunidad privada en Zapopan pensada para vivir distinto: amenidades de primer nivel, áreas verdes y excelente plusvalía.',
      'Esta es la oportunidad de adquirir el último terreno disponible en el desarrollo. Los datos de precio, superficie y ubicación exacta se actualizarán próximamente.',
    ],
    mapaEmbed: '',
  },
];

export const propiedadDestacada: Propiedad = propiedades.find((p) => p.destacada) ?? propiedades[0];
export const getPropiedad = (slug: string): Propiedad | undefined => propiedades.find((p) => p.slug === slug);
