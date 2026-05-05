import { supabase } from "@/integrations/supabase/client";

export interface SupabaseProductListItem {
  id: string;
  title: string;
  handle: string | null;
  price_colones: number;
  category: string;
  description: string | null;
  sizes: string[];
  size_guide_url: string | null;
  product_colors: {
    color_name: string;
    color_hex: string | null;
    image_url: string;
    sort_order: number;
  }[];
}

export async function fetchSupabaseProducts(category?: string, limit = 50): Promise<SupabaseProductListItem[]> {
  let query = supabase
    .from("products")
    .select("id, title, handle, price_colones, category, description, sizes, size_guide_url, product_colors(color_name, color_hex, image_url, sort_order)")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    console.error("Error loading supabase products:", error);
    return [];
  }
  return (data || []) as SupabaseProductListItem[];
}

export async function fetchSupabaseProductByHandle(handle: string): Promise<SupabaseProductListItem | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, handle, price_colones, category, description, sizes, size_guide_url, product_colors(color_name, color_hex, image_url, sort_order)")
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
  return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(amount);
}