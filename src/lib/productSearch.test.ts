import { beforeEach, describe, expect, it, vi } from "vitest";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));

import { isUuid, sanitizeSearchQuery, searchProducts } from "./productSearch";

const rows = [{ id: "p1", title: "Camisa negra", handle: "camisa-negra", price_colones: 12000 }];

/** Chainable PostgREST stub: every modifier returns itself, awaiting resolves the rows. */
function makeQuery(data: unknown[]): any {
  const query: any = {};
  for (const method of ["select", "eq", "is", "ilike", "order", "limit"]) {
    query[method] = vi.fn(() => query);
  }
  query.then = (onFulfilled: (v: { data: unknown[]; error: null }) => unknown) =>
    Promise.resolve({ data, error: null }).then(onFulfilled);
  return query;
}

describe("live product search", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("strips characters PostgREST reads as filter syntax and caps the length", () => {
    expect(sanitizeSearchQuery("camisa (negra)'x*,y\\*")).toBe("camisa negraxy");
    expect(sanitizeSearchQuery("a".repeat(500))).toHaveLength(100);
  });

  it("matches the title case-insensitively and keeps the newest-first order", async () => {
    const query = makeQuery(rows);
    from.mockReturnValue(query);
    const result = await searchProducts("  Cami  ", 6);
    expect(result).toEqual(rows);
    expect(query.ilike).toHaveBeenCalledWith("title", "%Cami%");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(6);
  });

  it("looks a full uuid up by id instead of by title", async () => {
    const query = makeQuery(rows);
    from.mockReturnValue(query);
    const id = "3f2504e0-4f89-41d3-9a0c-3a2b1c0d9e8f";
    await searchProducts(id);
    expect(query.eq).toHaveBeenCalledWith("id", id);
    expect(query.ilike).not.toHaveBeenCalled();
    expect(isUuid(id)).toBe(true);
    expect(isUuid("camisa")).toBe(false);
  });

  it("asks the database nothing when the query is blank", async () => {
    const result = await searchProducts("   ");
    expect(result).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });
});
