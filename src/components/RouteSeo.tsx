import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSupabaseProductByHandle } from "@/lib/supabaseProducts";
import { STYLES, GARMENT_TYPES } from "@/lib/catalog";
import { PUBLIC_PATHS, SITE_URL, SITE_TITLE, SITE_DESCRIPTION, productSchema } from "@/lib/seo";

export function RouteSeo() {
  const { pathname } = useLocation();
  const productHandle = pathname.startsWith("/product/") ? decodeURIComponent(pathname.slice(9)) : "";
  const { data: product, isPending } = useQuery({ queryKey: ["seo-product", productHandle], queryFn: () => fetchSupabaseProductByHandle(productHandle), enabled: Boolean(productHandle) });
  const style = STYLES.find(s => pathname === `/category/${s.slug}`);
  const garment = GARMENT_TYPES.find(g => pathname === `/categories/${g.slug}`);
  const label = style?.name || garment?.name || ({ "/styles": "Styles de ropa masculina", "/categories": "Categorías de ropa masculina", "/about": "Sobre nosotros", "/auth": "Mi cuenta", "/search": "Buscar productos", "/orders": "Mis pedidos", "/checkout": "Finalizar compra", "/admin": "Administración" } as Record<string, string>)[pathname];
  const title = product ? `${product.title} — Yellow Men Store CR` : label ? `${label} — Yellow Men Store CR` : SITE_TITLE;
  const description = product?.description || (label ? `${label} en Yellow Men Store CR. Explora ropa masculina y prendas únicas con envíos a Costa Rica.` : SITE_DESCRIPTION);
  const canonical = `${SITE_URL}${product ? `/product/${encodeURIComponent(product.handle || product.id)}` : pathname}`;
  const noindex = !PUBLIC_PATHS.includes(pathname) && !(productHandle && (isPending || product));
  const schema = product ? productSchema(product) : style || garment || pathname === "/styles" || pathname === "/categories" ? { "@context": "https://schema.org", "@type": "CollectionPage", name: label, url: canonical } : null;
  return <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta name="robots" content={noindex ? "noindex,follow" : "index,follow"} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content={product ? "product" : "website"} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {schema && <script type="application/ld+json">{JSON.stringify(schema).replace(/</g, "\\u003c")}</script>}
  </Helmet>;
}