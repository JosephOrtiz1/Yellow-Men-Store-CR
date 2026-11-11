# Navegación de colecciones
- [ ] Crear listado de Styles reutilizando Categorías y conectar navegación y «Ver más estilos»; verificar PC y móvil.
- [x] Añadir y verificar «Ver más estilos» y «Volver al inicio» en estilos y categorías, en PC y móvil.

# Producción
- [x] Conectar PayPal Live; configuración y botón verificados sin realizar cobros.
- [x] Archivar los 38 pedidos anteriores; ocultar pedidos, comprobantes y notificaciones vinculados.
- [x] Corregir los dos hallazgos del escaneo profundo y actualizar dependencias; 21 pruebas aprobadas, sin vulnerabilidades conocidas en dependencias.
- [x] Verificar envío guardado, detalles, botón PayPal Live y pedidos/admin con sesión; rechazo de webhook sin firma confirmado.
- [ ] Verificar una compra real completa: requiere autorización de un comprador y dinero real; no se realizó ningún cobro.

# Checkout completo
- [x] Agregar selección admin de destacados, sección compartida en portada y acceso desde navegación; guardado y recarga verificados, junto a pantallas de 375, 768, 1024 y 1974 px.
- [x] Corregir Categorías siempre amarillo en navegación de escritorio y móvil.
- [x] Añadir fotos de Darkwear y Japan Style al slider; seis fotos cargadas y rotación verificada en navegador.
- [x] Mostrar todos los productos al final de la vista de PC, sin límites de catálogo; catálogo real y prueba de 237 productos verificados.
- [x] Guardar y autollenar los datos de envío al confirmar el formulario, verificado tras recargar.
- [x] Agregar compra individual sin modificar el carrito; pedido SINPE creado y visible en Mis pedidos, con cuatro pruebas aprobadas.
- [x] Sustituir los diálogos de compra por una página de checkout con envío, pago y confirmación.
- [x] Explicar los estados de pago y pedido en checkout y Mis pedidos.
- [x] Verificar el flujo de compra y la presentación de la página (pedido SINPE de prueba creado; PayPal conserva el modo sandbox existente).

# Tarjeta y cuenta PayPal
- [x] Integrar campos seguros de tarjeta y botón de cuenta PayPal con ventana pequeña.
- [x] Conectar creación y captura autenticadas; comprobar creación real en sandbox, ventana abierta y reglas de confirmación con pruebas.
- [ ] Completar una compra real Visa/Mastercard con el botón oficial de PayPal: requiere autorización del comprador; no usar CardFields no elegibles para esta cuenta.

# Edición de productos
- [x] Agregar edición de productos existentes; guardado, recarga, conservación de imágenes y cancelación verificados con sesión de administrador.

# Navegación móvil
- [x] Quitar la barra superior en móvil; el header queda solo desde escritorio.
- [x] Conservar en el menú inferior los accesos que estaban arriba: cuenta, pedidos, panel admin, cerrar sesión y notificaciones.

# Hero y navegación
- [x] Slider de 4 imágenes en el hero (Techwear, Street Wear, Old Money, Casual) con barra de progreso segmentada, texto fijo y brillo reducido para legibilidad en móvil.
- [x] Corregir el scroll: cada página nueva abre desde arriba (ScrollToTop en App).
- [x] Renombrar la categoría visible «Cyber Wear» a «Techwear» (el slug interno cyber-wear se conserva para no perder productos).

# Productos aleatorios
- [x] Ordenar la home y las categorías en orden aleatorio (ya no por fecha de publicación), con botón «Mezclar» para volver a mezclar.
- [x] Verificado: mismo catálogo, orden distinto en cada carga y al mezclar (36 productos en home, 14 en Casual), sin errores de página.
