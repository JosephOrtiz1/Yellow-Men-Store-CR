import { supabase } from "@/integrations/supabase/client";

export interface SupabaseProductListItem {
  id: string;
  title: string;
  handle: string | null;
  price_colones: number;
  category: string;
  garment_type?: string | null;
  description: string | null;
  sizes: string[];
  size_guide_url: string | null;
  available?: boolean;
  product_colors: {
    color_name: string;
    color_hex: string | null;
    image_url: string;
    hover_image_url: string | null;
    sort_order: number;
    available?: boolean;
  }[];
}

/**
 * Randomizer: Fisher–Yates shuffle over a copy of the list.
 * `rand` is injectable so the order can be verified deterministically in tests.
 */
export function shuffleProducts<T>(items: T[], rand: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// When randomizing we pull a wider pool so older products can also surface,
// then shuffle and keep only the first `limit`.
const RANDOM_POOL_SIZE = 200;

export async function fetchSupabaseProducts(
  category?: string,
  limit = 50,
  options: { randomize?: boolean; garmentType?: string } = {},
): Promise<SupabaseProductListItem[]> {
  const { randomize = false, garmentType } = options;
  let query = supabase
    .from("products")
    .select("id, title, handle, price_colones, category, garment_type, description, sizes, size_guide_url, available, product_colors(color_name, color_hex, image_url, hover_image_url, sort_order, available)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(randomize ? Math.max(limit, RANDOM_POOL_SIZE) : limit);

  if (category) query = query.eq("category", category);
  if (garmentType) query = query.eq("garment_type", garmentType);

  const { data, error } = await query;
  if (error) {
    console.error("Error loading supabase products:", error);
    return [];
  }
  const items = (data || []) as SupabaseProductListItem[];
  return randomize ? shuffleProducts(items).slice(0, limit) : items;
}

export async function fetchSupabaseProductByHandle(handle: string): Promise<SupabaseProductListItem | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, handle, price_colones, category, garment_type, description, sizes, size_guide_url, available, product_colors(color_name, color_hex, image_url, hover_image_url, sort_order, available)")
    .eq("handle", handle)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    console.error(error);
    return null;
  }
  return data as SupabaseProductListItem | null;
}

export function formatColones(amount: number): string {
  // Formato con espacios cada 3 dígitos: "₡1 000 000"
  const rounded = Math.round(amount);
  const withSpaces = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `₡${withSpaces}`;
}

export function formatNumberSpaces(amount: number, decimals = 0): string {
  const fixed = decimals > 0 ? amount.toFixed(decimals) : Math.round(amount).toString();
  const [intPart, decPart] = fixed.split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart ? `${withSpaces}.${decPart}` : withSpaces;
}