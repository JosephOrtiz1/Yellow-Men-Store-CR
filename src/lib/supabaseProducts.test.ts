import { describe, expect, it, vi } from "vitest";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));

import { fetchSupabaseProducts, shuffleProducts } from "./supabaseProducts";

const items = Array.from({ length: 6 }, (_, i) => ({ id: `p${i}` }));

/** Chainable PostgREST stub: every modifier returns itself, awaiting resolves the rows. */
function makeQuery(data: unknown[]): any {
  const query: any = {};
  for (const method of ["select", "eq", "is", "order", "limit"]) {
    query[method] = vi.fn(() => query);
  }
  query.then = (onFulfilled: (v: { data: unknown[]; error: null }) => unknown) =>
    Promise.resolve({ data, error: null }).then(onFulfilled);
  return query;
}

describe("product randomizer", () => {
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
});
