import { STYLES, GARMENT_TYPES } from "./catalog";
import type { SupabaseProductListItem } from "./supabaseProducts";

export const SITE_URL = "https://yellowmenstore.lovable.app";
export const SITE_TITLE = "Yellow Men Store CR — Ropa masculina en Costa Rica";
export const SITE_DESCRIPTION = "Ropa masculina en Costa Rica: Street Wear, Casual, Techwear, Old Money, Japan Style y Darkwear. Explora prendas únicas y compra en línea.";
export const PUBLIC_PATHS = ["/", "/about", "/styles", "/categories", ...STYLES.map(s => `/category/${s.slug}`), ...GARMENT_TYPES.map(g => `/categories/${g.slug}`)];

export function productSchema(product: SupabaseProductListItem) {
  const url = `${SITE_URL}/product/${encodeURIComponent(product.handle || product.id)}`;
  const images = product.product_colors.flatMap(c => [c.image_url, c.hover_image_url]).filter((image): image is string => Boolean(image?.startsWith("https://")));
  return {
    "@context": "https://schema.org", "@type": "Product", name: product.title,
    description: product.description || product.title, image: images, sku: product.id, url,
    offers: {
      "@type": "Offer", url, priceCurrency: "CRC", price: Number(product.price_colones).toFixed(2),
      availability: `https://schema.org/${product.available !== false && (product.product_colors.length === 0 || product.product_colors.some(c => c.available !== false)) ? "InStock" : "OutOfStock"}`,
      seller: { "@type": "Organization", name: "Yellow Men Store CR" },
    },
  };
}