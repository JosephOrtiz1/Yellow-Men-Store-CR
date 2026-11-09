import { supabase } from "@/integrations/supabase/client";

export interface ProductSearchResult {
  id: string;
  title: string;
  handle: string | null;
  price_colones: number;
  category: string;
  product_colors: { image_url: string }[];
}

/** PostgREST treats these as filter syntax, so they never reach the query. */
export const QUERY_LENGTH_LIMIT = 100;

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[,()."'\\*]/g, "").slice(0, QUERY_LENGTH_LIMIT);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Active catalog search used by both the header suggestions and the /search page.
 * A full UUID is treated as an id lookup, anything else as a case-insensitive
 * title match. Results stay newest-first (no shuffle) so typing feels predictable.
 */
export async function searchProducts(
  query: string,
  limit = 6,
): Promise<ProductSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let request = supabase
    .from("products")
    .select("id, title, handle, price_colones, category, product_colors(image_url)")
    .eq("is_active", true)
    .is("deleted_at", null);

  request = isUuid(trimmed)
    ? request.eq("id", trimmed)
    : request.ilike("title", `%${sanitizeSearchQuery(trimmed)}%`);

  const { data, error } = await request.order("created_at", { ascending: false }).limit(limit);

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }
  return (data || []) as ProductSearchResult[];
}
