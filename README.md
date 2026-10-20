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

## Variables sensibles

Las credenciales de PayPal (sandbox) (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (y opcionales `PAYPAL_ENV=live`, `CRC_PER_USD`)) se configuran como secrets de Lovable Cloud. Mientras no estén presentes, los pedidos se registran como `unpaid` y la pasarela responde 503.
