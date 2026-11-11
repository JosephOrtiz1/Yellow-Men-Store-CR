# Yellow Men Store CR

E-commerce de ropa masculina urbana (street wear, casual, cyber wear, old money) con envíos a todo Costa Rica.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (carrito local en `localStorage`)
- Lovable Cloud (Supabase) — catálogo, autenticación, órdenes, almacenamiento de imágenes
- Edge Functions: `create-order` (cálculo de totales server-side) y `paypal-create-order` y `paypal-capture-order`

## Estructura

- `src/pages/` — rutas (Home, Categoría, Producto, Carrito, Admin, Auth, Orders, About)
- `src/components/` — UI compartida (Header, Footer, CartDrawer, ProductCard, etc.)
- `src/stores/cartStore.ts` — estado del carrito
- `src/lib/supabaseProducts.ts` — acceso al catálogo
- `supabase/functions/` — funciones serverless

## Pagos de producción

PayPal usa la conexión Live a través del gateway, con `LOVABLE_API_KEY` y `PAYPAL_API_KEY` solo en funciones. El identificador público `PAYPAL_CLIENT_ID` carga el SDK. `PAYPAL_WEBHOOK_ID` identifica el webhook registrado; sin él no se habilita el checkout PayPal.

La conversión actual es ₡510/USD. Creación y captura usan claves de idempotencia por pedido. Solo `paypal-webhook`, tras verificar firma y comprobar importe, moneda e identidad de pedido con PayPal, guarda el pago confirmado. Los pedidos anteriores a producción se conservan archivados y no se muestran en las listas operativas.
