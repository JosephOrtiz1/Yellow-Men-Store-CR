import { describe, expect, it, vi } from "vitest";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));

import { fetchSupabaseProducts, getFeaturedProducts, shuffleProducts } from "./supabaseProducts";

const items = Array.from({ length: 6 }, (_, i) => ({ id: `p${i}` }));

/** Chainable PostgREST stub: every modifier returns itself, awaiting resolves the rows. */
function makeQuery(data: unknown[]): any {
  const query: any = {};
  for (const method of ["select", "eq", "is", "order", "limit", "range"]) {
    query[method] = vi.fn(() => query);
  }
  query.then = (onFulfilled: (v: { data: unknown[]; error: null }) => unknown) =>
    Promise.resolve({ data, error: null }).then(onFulfilled);
  return query;
}

describe("product randomizer", () => {
  it("shows only products selected as featured by admin, without a cap", () => {
    const featured = Array.from({ length: 60 }, (_, i) => ({ id: `featured-${i}`, is_featured: true }));
    const catalog: { id: string; is_featured?: boolean }[] = [...featured, { id: "normal", is_featured: false }, { id: "unset" }];
    expect(getFeaturedProducts(catalog))
      .toEqual(featured);
  });

  it("keeps every product exactly once and drops the publication order", () => {
    const shuffled = shuffleProducts(items, () => 0.5);
    expect(shuffled.map((p) => p.id)).toEqual(["p0", "p5", "p1", "p4", "p2", "p3"]);
    expect([...shuffled].map((p) => p.id).sort()).toEqual(items.map((p) => p.id));
  });

  it("does not mutate the list it receives", () => {
    const original = items.map((p) => p.id);
    shuffleProducts(items, () => 0.5);
    expect(items.map((p) => p.id)).toEqual(original);
  });

  it("returns products shuffled and only the requested amount", async () => {
    const query = makeQuery(items);
    from.mockReturnValue(query);
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const result = await fetchSupabaseProducts("casual", 3, { randomize: true });
    expect(result.map((p) => p.id)).toEqual(["p0", "p5", "p1"]);
    expect(query.eq).toHaveBeenCalledWith("category", "casual");
    expect(query.limit).toHaveBeenCalledWith(200);
    randomSpy.mockRestore();
  });

  it("keeps the newest-first order when not randomizing", async () => {
    const query = makeQuery(items);
    from.mockReturnValue(query);
    const result = await fetchSupabaseProducts(undefined, 50);
    expect(result.map((p) => p.id)).toEqual(["p0", "p1", "p2", "p3", "p4", "p5"]);
    expect(query.limit).toHaveBeenCalledWith(50);
  });

  it("loads every product across pages without the 50-product or 200-product cap", async () => {
    const catalog = Array.from({ length: 237 }, (_, i) => ({ id: `product-${i}` }));
    const firstPage = makeQuery(catalog.slice(0, 200));
    const lastPage = makeQuery(catalog.slice(200));
    from.mockReturnValueOnce(firstPage).mockReturnValueOnce(lastPage);
    const result = await fetchSupabaseProducts(undefined, 50, { all: true, randomize: true });
    expect(result).toHaveLength(237);
    expect(new Set(result.map((p) => p.id))).toEqual(new Set(catalog.map((p) => p.id)));
    expect(firstPage.range).toHaveBeenCalledWith(0, 199);
    expect(lastPage.range).toHaveBeenCalledWith(200, 399);
    expect(firstPage.limit).not.toHaveBeenCalled();
  });
});
