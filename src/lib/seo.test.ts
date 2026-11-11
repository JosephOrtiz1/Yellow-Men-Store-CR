import { describe, expect, it } from "vitest";
import { PUBLIC_PATHS, productSchema } from "./seo";
import type { SupabaseProductListItem } from "./supabaseProducts";

const product: SupabaseProductListItem = { id: "test", handle: "camisa", title: "Camisa", price_colones: 47990, category: "casual", description: null, sizes: [], size_guide_url: null, available: true, product_colors: [{ color_name: "Negro", color_hex: null, image_url: "https://example.com/shirt.jpg", hover_image_url: null, sort_order: 0, available: true }] };
describe("Public search data", () => {
  it("uses the catalog price in CRC, not the PayPal USD conversion", () => {
    expect(productSchema(product).offers).toMatchObject({ price: "47990.00", priceCurrency: "CRC" });
  });
  it("does not advertise unavailable garments as in stock", () => {
    expect(productSchema({ ...product, available: false }).offers.availability).toBe("https://schema.org/OutOfStock");
    expect(productSchema({ ...product, product_colors: product.product_colors.map(c => ({ ...c, available: false })) }).offers.availability).toBe("https://schema.org/OutOfStock");
  });
  it("excludes account and purchase surfaces from public discovery", () => {
    for (const path of ["/admin", "/auth", "/checkout", "/orders", "/search"]) expect(PUBLIC_PATHS).not.toContain(path);
    expect(PUBLIC_PATHS).toContain("/category/cyber-wear");
    expect(PUBLIC_PATHS).toContain("/categories/camisas");
  });
});