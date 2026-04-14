

## Yellow Men Store — Tienda E-commerce de Ropa Masculina

### Diseño Visual
- **Colores**: Amarillo (#FFD700 / #FFC107) y Negro (#0A0A0A / #1A1A1A) como colores principales, con blanco para contraste
- **Tipografía**: Bebas Neue para títulos (bold, impactante) + Barlow para cuerpo (limpio, legible)
- **Estilo**: Minimalista, moderno, con mucho contraste amarillo/negro
- **Border radius**: Mínimo (4px) para un look urbano y afilado

### Páginas y Secciones

**1. Página Principal (Hero + Grid)**
- Hero banner grande con nombre "Yellow Men Store", tagline y CTA "Ver Colección"
- Grid de productos cargados desde Shopify (muestra "No hay productos aún" si vacío)
- Sección de categorías: Street Wear, Casual, Cybertech, Japan Style
- Sección "Sobre Nosotros" explicando la historia de la tienda (transición de Instagram a web)

**2. Página de Categorías (/category/:slug)**
- Filtro por categoría con productos de Shopify filtrados por tags
- Grid de productos responsive

**3. Página de Producto (/product/:handle)**
- Galería de imágenes del producto
- Selector de tallas y colores (variantes de Shopify)
- Precio, descripción, botón "Agregar al Carrito"

**4. Sección "Sobre Nosotros"**
- Historia de la tienda, misión, enlace a Instagram

**5. Panel de Administrador (/admin)**
- Protegido con contraseña simple
- Formulario para crear productos con título, descripción, precio, imágenes, tallas y colores
- Lista de productos existentes con opción de editar/eliminar
- Todo conectado a la API de Shopify real

### Funcionalidades Core
- **Carrito**: Drawer lateral con Zustand + Shopify Storefront API
- **Checkout**: Redirige a Shopify Checkout (tarjeta/PayPal configurables desde Shopify Admin)
- **Categorías**: Navegación por categoría usando tags de Shopify
- **Variantes**: Selección de talla y color en la página de producto
- **Responsive**: Optimizado para móvil (tus clientes vienen de Instagram)

### Navegación
- Header fijo con logo "Yellow Men Store", links a categorías, ícono de carrito con badge
- Footer con info de contacto y enlace a Instagram

### Seguridad
- Panel admin protegido con contraseña
- Input validation en formularios
- Sin datos sensibles expuestos en el frontend

### Dependencias a instalar
- `zustand` para estado del carrito

