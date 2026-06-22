# Diseño — Sitio web Habid Navarro Bienes Raíces

**Fecha:** 2026-06-22
**Autor:** Habid Navarro (con Claude)
**Estado:** Aprobado, listo para plan de implementación

---

## 1. Objetivo

Crear un mini-sitio web profesional, minimalista y elegante para la marca personal
de **Habid Navarro**, asesor inmobiliario en Guadalajara / Zapopan, Jalisco. El
objetivo inmediato es **vender el terreno "Valle Imperial"** (último a la venta en
ese desarrollo) presentándolo de forma atractiva a posibles compradores, con
contacto directo y sin fricción. El sitio está pensado para **reutilizarse y crecer**
con futuras propiedades sin rediseñar nada.

**Métricas de éxito:**
- Un visitante entiende qué es Valle Imperial y puede contactar a Habid en < 30 s.
- Se ve profesional y carga rápido en celular (la mayoría del tráfico será móvil/WhatsApp).
- Al compartir el link en WhatsApp/Facebook aparece una tarjeta atractiva (foto + título).
- Agregar una propiedad nueva en el futuro = agregar un archivo de contenido, sin tocar diseño.

## 2. Audiencia e idioma

- **Audiencia:** compradores e inversionistas del área metropolitana de Guadalajara.
- **Idioma:** español (México) únicamente.
- **Dispositivo principal:** móvil. Diseño *mobile-first*.

## 3. Stack técnico y hosting

| Pieza | Elección | Por qué |
|-------|----------|---------|
| Generador | **Astro** (sitio estático) | Multipágina con layout/componentes compartidos; propiedades como *content collections* (agregar propiedad = agregar archivo); excelente optimización de imágenes; HTML casi sin JS → rápido y bueno para SEO. |
| Estilos | CSS propio + variables de diseño (sin framework pesado) | Control total del look "Oscuro Premium", peso mínimo. |
| Hosting | **Cloudflare Pages** (plan gratis) | Gratis, HTTPS/SSL automático, CDN global, *deploy* automático al hacer push a GitHub. |
| Repositorio | GitHub (este repo) conectado a Cloudflare Pages | Cada cambio se publica solo. |
| Dominio | **habidnavarro.com** vía Cloudflare Registrar (~$10 USD/año) | Ver §10. |

**Alternativa considerada y descartada:** HTML/CSS puro sin build. Más simple de
hostear (arrastrar y soltar) pero duplica nav/footer en cada página y hace tedioso
agregar propiedades. Astro gana por mantenibilidad.

**Flujo de publicación:** push a `main` en GitHub → Cloudflare Pages construye Astro
y publica automáticamente. Setup inicial es una sola vez.

## 4. Arquitectura de información (páginas)

Navegación global (todas las páginas): **logo · Inicio · Propiedades · Sobre mí · Contacto**.
Footer global y **botón flotante de WhatsApp** en todas las páginas.

| Ruta | Página | Contenido |
|------|--------|-----------|
| `/` | **Inicio** | Hero de Valle Imperial · por qué la zona · propiedad destacada · vistazo de amenidades · llamado a la acción (CTA) |
| `/propiedades` | **Propiedades** | Rejilla de propiedades. Hoy: una tarjeta (Valle Imperial). Estructura lista para más. |
| `/propiedades/valle-imperial` | **Ficha de propiedad** | Galería · datos clave (precio, m², tipo, ubicación) · descripción · amenidades · ubicación/mapa · CTA de contacto |
| `/sobre-mi` | **Sobre mí** | Foto · bio · experiencia · por qué confiar en Habid · CTA |
| `/contacto` | **Contacto** | WhatsApp · llamar · correo · redes sociales · zona donde opera · aviso de privacidad |

## 5. Modelo de contenido (propiedad)

Cada propiedad es un archivo en una *content collection* de Astro con estos campos
(los valores `****` están **pendientes de que Habid los actualice**):

```yaml
nombre: "Valle Imperial"
slug: "valle-imperial"
estado: "En venta"            # En venta | Vendido | Apartado
destacada: true               # aparece como destacada en Inicio
tipo: "****"                  # ¿Terreno? ¿incluye construcción? — PENDIENTE
precio: "****"                # número o "Precio a consultar" — PENDIENTE
moneda: "MXN"
superficie_m2: "****"         # PENDIENTE
ubicacion: "****"             # nombre del fraccionamiento — PENDIENTE
municipio: "Zapopan"
entidad: "Jalisco"
amenidades:                   # confirmadas del banner; ampliables
  - "Cinemex"
  - "Alberca"
  - "Salón de eventos"
  - "Áreas verdes"
mapa_embed: "****"            # URL/iframe de Google Maps — PENDIENTE
galeria:                      # imágenes de muestra hasta tener fotos reales
  - "/img/placeholder/valle-1.jpg"
  - "/img/placeholder/valle-2.jpg"
  - "/img/placeholder/valle-3.jpg"
descripcion: |               # borrador editable (ver §7)
  ...
```

## 6. Sistema de diseño — "Oscuro Premium"

**Paleta**
- Fondo: `#0B0F14` (negro azulado)
- Superficie/tarjetas: `#11161C`
- Borde sutil: `#1C2630`
- Texto principal: `#E7EDF3`
- Texto apagado: `#9AA6B2`
- Acento (degradado de marca): `#2B7CC4 → #3BB5E8`
- WhatsApp: `#25D366`

**Tipografía**
- Títulos: **Sora** (sans moderna, firme, profesional).
- Cuerpo: **Inter**.
- Servidas vía Google Fonts (o auto-hospedadas para velocidad).

**Componentes reutilizables**
- `Nav` fija translúcida con logo (variante para fondo oscuro).
- `Hero` con titular en degradado + CTA.
- `PropertyCard` (tarjeta de propiedad).
- `KeyFacts` (franja de datos clave: precio, m², tipo, ubicación).
- `AmenityGrid` (rejilla de amenidades con íconos).
- `Gallery` (galería con lightbox sencillo).
- `CtaBand` (franja de llamado a la acción).
- `Footer` global.
- `WhatsAppFab` (botón flotante).

**Principios:** mucho espacio en blanco (negro), jerarquía clara, foto grande,
animaciones mínimas y sobrias, todo legible y rápido en móvil.

## 7. Contenido redactado

**Bio "Sobre mí" (borrador, editable):**

> Soy **Habid Navarro**, asesor inmobiliario en Guadalajara y Zapopan. Acompaño a
> mis clientes a encontrar el terreno o la propiedad correcta para invertir y vivir
> mejor, con asesoría honesta y cero presión —desde la primera visita hasta la firma.
>
> Conozco a fondo las zonas de mayor plusvalía de la Zona Metropolitana de Guadalajara
> y trabajo con desarrollos de primer nivel como **Valle Imperial**. Mi compromiso es
> simple: información clara, trato cercano y una decisión de inversión fácil y segura.

*(Opcional si Habid quiere: agregar "con X años de experiencia". No se menciona cédula.)*

**Descripción de Valle Imperial (borrador, editable):**

> **Valle Imperial** es una comunidad privada en Zapopan pensada para vivir distinto:
> amenidades de primer nivel, áreas verdes y excelente plusvalía. Esta es la
> oportunidad de adquirir el **último terreno disponible** en el desarrollo.
> *(Datos de precio, superficie y ubicación: pendientes de actualizar.)*

**Tagline de marca:** "Asesoría inmobiliaria honesta en Guadalajara y Zapopan."

## 8. Contacto y conversión

Sin backend: todo por **enlaces directos** (gratis, sin servidor).

- **WhatsApp** (principal): `https://wa.me/523921075791?text=Hola%20Habid,%20me%20interesa%20Valle%20Imperial`
  - Botón flotante en todas las páginas + CTAs en hero, ficha y contacto.
- **Llamar:** `tel:+523921075791`
- **Correo:** `mailto:habid.realestate@gmail.com?subject=Interesado%20en%20Valle%20Imperial`
- **Redes:** Instagram [@habid.realestate](https://instagram.com/habid.realestate); Facebook "Habid Real Estate" *(URL exacta de la página: pendiente de confirmar)*.

**Número único:** +52 392 107 5791 para WhatsApp y llamadas. Se retira el viejo
(33) 3398-9145 (a menos que Habid pida conservarlo).

## 9. SEO, compartir y extras

- **Favicon** y logo derivados de la imagen de marca (logo sobre negro).
- **Open Graph / Twitter Card:** imagen de compartir (foto de Valle Imperial + título)
  para que el link se vea bien en WhatsApp/Facebook. Prioritario para este caso.
- Meta-descripciones, títulos por página, `sitemap.xml`, `robots.txt`.
- Texto alternativo en imágenes, buen contraste, navegable por teclado.
- **Aviso de privacidad** sencillo (buena práctica al invitar a contactar).

## 10. Recomendación de dominio

1. **habidnavarro.com** — Cloudflare Registrar, **~$10.46 USD/año** (mismo precio de
   renovación). Corto, tu nombre, sin guiones, y como el sitio vive en Cloudflare el
   DNS se configura solo. **Elección principal.**
2. *Opcional:* **habidrealestate.com** (~$10/año) para conservar la URL del banner
   viejo y redirigirla al dominio principal.
3. Descartado: `.realestate` (~$73/año, premium) y `.mx` (~$30-45/año; más caro, no
   imprescindible). Verificar disponibilidad en el checkout antes de comprar.

## 11. Inventario de contenido

| Dato | Estado |
|------|--------|
| Logo / marca | ✅ Tengo (carpeta `documentos_de_referencia/`) |
| Teléfono/WhatsApp +52 392 107 5791 | ✅ Confirmado |
| Correo habid.realestate@gmail.com | ✅ Confirmado |
| Instagram @habid.realestate | ✅ Confirmado |
| Facebook (nombre) | ✅ Confirmado · URL exacta ⏳ por confirmar |
| Bio "Sobre mí" | ✅ Redactada (editable) |
| Foto de Habid | ⏳ Pendiente (placeholder mientras) |
| Precio / m² / tipo / ubicación exacta de Valle Imperial | ⏳ **`****` — Habid actualizará** |
| Mapa de ubicación | ⏳ Pendiente |
| Fotos reales del terreno/desarrollo | ⏳ Pendiente (imágenes de muestra mientras) |

## 12. Fuera de alcance (YAGNI)

- Sin CMS/panel de administración, sin cuentas de usuario.
- Sin buscador ni filtros (solo una propiedad por ahora).
- Sin blog, sin pagos en línea.
- Sin formulario con backend (solo enlaces directos).
- Sin versión en inglés (solo español).
- Sin integración de mapa pesada (basta un embed/enlace de Google Maps).

## 13. Criterios de aceptación

- Las 5 vistas (`/`, `/propiedades`, `/propiedades/valle-imperial`, `/sobre-mi`,
  `/contacto`) existen, se ven "Oscuro Premium" y son responsivas.
- Botón flotante de WhatsApp funciona con mensaje pre-llenado en todas las páginas.
- Enlaces de WhatsApp, llamar y correo usan +52 392 107 5791 / el correo correcto.
- Los datos pendientes del terreno aparecen como `****` visibles para facilitar su actualización.
- El sitio compila con Astro y se puede desplegar en Cloudflare Pages.
- Al compartir el link sale tarjeta OG con imagen + título.
