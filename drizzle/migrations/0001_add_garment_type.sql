ALTER TABLE public.products ADD COLUMN IF NOT EXISTS garment_type text;
CREATE INDEX IF NOT EXISTS products_garment_type_idx ON public.products (garment_type);
COMMENT ON COLUMN public.products.category IS 'Style slug (street-wear, casual, cyber-wear, old-money, japan-style, darkwear)';
COMMENT ON COLUMN public.products.garment_type IS 'Garment category slug (camisas, camisetas, sudaderas, etc.)';