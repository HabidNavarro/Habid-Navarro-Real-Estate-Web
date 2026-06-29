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
    slug: 'casa-ocotlan',
    nombre: 'Casa en Ocotlán',
    estado: 'En venta',
    destacada: true,
    tipo: 'Casa · 2 recámaras',
    precio: '$2,500,000',
    superficie: '108.1',
    ubicacion: 'Islas Vírgenes 284-C',
    municipio: 'Ocotlán',
    entidad: 'Jalisco',
    amenidades: [
      '2 recámaras',
      'Cocina con alacenas de material y madera',
      'Área de estudio',
      'Salita de TV',
      'Cuarto de servicio techado',
      'Cochera con portón',
      'Estructura de concreto colado',
      'Preparada para crecer a 3 niveles',
      'Aljibe y boiler',
      'Protecciones y mosquiteros',
      'Patio sellado y encementado',
    ],
    galeria: [
      '/img/ocotlan/ocotlan-1.jpg',
      '/img/ocotlan/ocotlan-2.jpg',
      '/img/ocotlan/ocotlan-3.jpg',
      '/img/ocotlan/ocotlan-4.jpg',
      '/img/ocotlan/ocotlan-5.jpg',
      '/img/ocotlan/ocotlan-6.jpg',
      '/img/ocotlan/ocotlan-7.jpg',
      '/img/ocotlan/ocotlan-8.jpg',
      '/img/ocotlan/ocotlan-9.jpg',
      '/img/ocotlan/ocotlan-11.jpg',
    ],
    resumen: 'Casa de concreto colado en Ocotlán, sobre placa estructural y preparada para crecer hasta tres niveles. 108.1 m² de terreno, totalmente sellada y con protecciones y mosquiteros en toda la casa.',
    descripcion: [
      'Casa sólida en Ocotlán, construida en concreto colado —no en ladrillo ni hormigón— sobre placa estructural. El terreno es de 108.1 m² (6 m de frente por 18 m de fondo) y está calculada para crecer a dos plantas, más un cuarto de servicio y una terraza en un tercer nivel, sin necesidad de reforzar los cimientos.',
      'Es el modelo de tres recámaras, pero la recámara del frente se transformó en cocina. Hoy se distribuye en dos recámaras, un área de estudio (la cocina original) y una salita de TV —que también es el espacio listo para las escaleras si decides construir la segunda planta. La cocina mide 3 × 3 m, con alacenas de material y madera.',
      'El flujo de servicio está muy bien pensado: la cocina conecta con el cuarto de servicio al frente, y este con la cochera, así puedes meter insumos y sacar la basura sin pasar por el comedor. El cuarto de servicio está techado con bóveda, con reja, protección y mosquitero; ahí están el aljibe y el boiler, y el tanque estacionario va en la azotea.',
      'Todo está sellado y terminado: el patio trasero tiene un techo de lámina de 3 × 3 m y el resto va con protección y mosquitero; está totalmente encementado, sin terracería en ningún espacio. Toda la casa cuenta con protecciones y mosquiteros. La cochera está bardeada, con vitropiso y portón —se dejó abierta a propósito para no perder la iluminación ni la ventilación natural.',
    ],
    mapaEmbed: '<iframe src="https://www.google.com/maps?q=Islas%20V%C3%ADrgenes%20284-C%2C%20Ocotl%C3%A1n%2C%20Jalisco&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Ubicación de la casa en Ocotlán" allowfullscreen></iframe>',
  },

  // Propiedades de demostración (escasez): fotos de stock (Unsplash), datos ficticios.
  // Editar o eliminar cuando haya inventario real disponible.
  {
    slug: 'casa-zapopan',
    nombre: 'Casa en Zapopan',
    estado: 'Apartada',
    destacada: false,
    tipo: 'Casa · 3 recámaras',
    precio: '$4,200,000',
    superficie: '220',
    ubicacion: 'Valle Real',
    municipio: 'Zapopan',
    entidad: 'Jalisco',
    amenidades: ['3 recámaras', '2.5 baños', 'Alberca', 'Cochera 2 autos', 'Jardín', 'Seguridad 24/7'],
    galeria: ['/img/catalogo/ext-3.jpg', '/img/catalogo/int-1.jpg', '/img/catalogo/int-2.jpg'],
    resumen: 'Residencia moderna en Valle Real, Zapopan, con alberca, acabados de lujo y seguridad las 24 horas.',
    descripcion: [
      'Residencia contemporánea en una de las zonas de mayor plusvalía de Zapopan, con amplios espacios, iluminación natural y acabados de primer nivel.',
      'Cuenta con jardín, alberca y seguridad 24/7 dentro de un fraccionamiento privado.',
    ],
    mapaEmbed: '',
  },
  {
    slug: 'casa-providencia',
    nombre: 'Casa en Providencia',
    estado: 'Vendida',
    destacada: false,
    tipo: 'Casa · 4 recámaras',
    precio: '$6,800,000',
    superficie: '280',
    ubicacion: 'Providencia',
    municipio: 'Guadalajara',
    entidad: 'Jalisco',
    amenidades: ['4 recámaras', '3.5 baños', 'Alberca', 'Roof garden', 'Cochera 3 autos', 'Cocina integral'],
    galeria: ['/img/catalogo/ext-4.jpg', '/img/catalogo/int-3.jpg', '/img/catalogo/int-1.jpg'],
    resumen: 'Casa de lujo en Providencia, Guadalajara: 280 m², alberca, roof garden y acabados premium.',
    descripcion: [
      'Casa de gran nivel en el corazón de Providencia, a pasos de los mejores servicios de Guadalajara.',
      'Diseño abierto, doble altura, alberca y roof garden con vista a la ciudad.',
    ],
    mapaEmbed: '',
  },
  {
    slug: 'casa-chapala',
    nombre: 'Casa en Chapala',
    estado: 'Apartada',
    destacada: false,
    tipo: 'Casa · 3 recámaras',
    precio: '$3,100,000',
    superficie: '190',
    ubicacion: 'Ribera de Chapala',
    municipio: 'Chapala',
    entidad: 'Jalisco',
    amenidades: ['3 recámaras', '2 baños', 'Vista al lago', 'Jardín amplio', 'Cochera 2 autos', 'Terraza'],
    galeria: ['/img/catalogo/ext-1.jpg', '/img/catalogo/int-2.jpg', '/img/catalogo/int-3.jpg'],
    resumen: 'Casa de descanso en la ribera de Chapala, con jardín, terraza y un clima envidiable todo el año.',
    descripcion: [
      'Retiro ideal a orillas del lago de Chapala, con jardín amplio y terraza para disfrutar el clima templado de la ribera.',
      'A pocos minutos del malecón y los servicios de Chapala y Ajijic.',
    ],
    mapaEmbed: '',
  },
  {
    slug: 'casa-tlaquepaque',
    nombre: 'Casa en Tlaquepaque',
    estado: 'Vendida',
    destacada: false,
    tipo: 'Casa · 3 recámaras',
    precio: '$2,950,000',
    superficie: '165',
    ubicacion: 'Centro de Tlaquepaque',
    municipio: 'Tlaquepaque',
    entidad: 'Jalisco',
    amenidades: ['3 recámaras', '2 baños', 'Patio central', 'Cocina integral', 'Cochera', 'Bodega'],
    galeria: ['/img/catalogo/ext-5.jpg', '/img/catalogo/int-1.jpg', '/img/catalogo/int-3.jpg'],
    resumen: 'Casa con encanto tradicional en el centro de Tlaquepaque, con patio central y amplios espacios.',
    descripcion: [
      'Casa de estilo tradicional tapatío en el centro de San Pedro Tlaquepaque, con patio central iluminado y techos altos.',
      'A unos pasos del centro histórico, galerías y restaurantes.',
    ],
    mapaEmbed: '',
  },
  {
    slug: 'casa-tlajomulco',
    nombre: 'Casa en Tlajomulco',
    estado: 'Apartada',
    destacada: false,
    tipo: 'Casa · 2 recámaras',
    precio: '$1,980,000',
    superficie: '140',
    ubicacion: 'Santa Fe',
    municipio: 'Tlajomulco',
    entidad: 'Jalisco',
    amenidades: ['2 recámaras', '1.5 baños', 'Cochera 2 autos', 'Jardín', 'Cocina integral', 'Caseta de vigilancia'],
    galeria: ['/img/catalogo/ext-2.jpg', '/img/catalogo/int-2.jpg', '/img/catalogo/int-1.jpg'],
    resumen: 'Casa moderna en un coto privado de Tlajomulco (Santa Fe), ideal para estrenar y crecer.',
    descripcion: [
      'Casa moderna en coto privado en la zona de Santa Fe, Tlajomulco, con excelente conectividad al sur de la ciudad.',
      'Espacios funcionales, jardín y vigilancia en caseta.',
    ],
    mapaEmbed: '',
  },
];

export const propiedadDestacada: Propiedad = propiedades.find((p) => p.destacada) ?? propiedades[0];
export const getPropiedad = (slug: string): Propiedad | undefined => propiedades.find((p) => p.slug === slug);
