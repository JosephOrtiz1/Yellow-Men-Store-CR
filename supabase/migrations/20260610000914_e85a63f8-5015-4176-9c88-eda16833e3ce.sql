
-- Disponibilidad de productos y variantes (stock simple)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;

ALTER TABLE public.product_colors
  ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;

-- Campos de pago y desglose para órdenes
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_colones numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_cost_colones numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_checkout_url text;

-- Eliminar política duplicada
DROP POLICY IF EXISTS "Users can create their own pending orders" ON public.orders;
