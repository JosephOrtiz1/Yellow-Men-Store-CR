// Styles are stored in products.category (legacy column name; slugs must not change).
export const STYLES = [
  { name: "Street Wear", slug: "street-wear", description: "Estilo urbano y audaz" },
  { name: "Casual", slug: "casual", description: "Comodidad con estilo" },
  { name: "Techwear", slug: "cyber-wear", description: "Futurismo en cada prenda" },
  { name: "Old Money", slug: "old-money", description: "Elegancia atemporal" },
  { name: "Japan Style", slug: "japan-style", description: "Inspiración japonesa" },
  { name: "Darkwear", slug: "darkwear", description: "Siluetas oscuras" },
] as const;

// Garment categories are stored in products.garment_type.
export const GARMENT_TYPES = [
  { name: "Camisas", slug: "camisas" },
  { name: "Camisetas", slug: "camisetas" },
  { name: "Sudaderas", slug: "sudaderas" },
  { name: "Chaquetas", slug: "chaquetas" },
  { name: "Pantalones", slug: "pantalones" },
  { name: "Kimonos", slug: "kimonos" },
  { name: "Zapatos", slug: "zapatos" },
  { name: "Accesorios", slug: "accesorios" },
  { name: "Otras prendas", slug: "otros" },
] as const;

export const styleName = (slug?: string | null) =>
  STYLES.find((s) => s.slug === slug)?.name ?? slug ?? "";
export const garmentName = (slug?: string | null) =>
  GARMENT_TYPES.find((g) => g.slug === slug)?.name ?? slug ?? "";
