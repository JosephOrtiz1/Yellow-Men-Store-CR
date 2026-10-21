import { beforeEach, describe, expect, it, vi } from "vitest";
const { upsert } = vi.hoisted(() => ({ upsert: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ upsert }) } }));
import { saveShippingProfile } from "./shippingProfile";

describe("saved shipping", () => {
  beforeEach(() => upsert.mockReset());
  it("saves every shipping field for the current customer before purchase", async () => {
    upsert.mockResolvedValue({ error: null });
    await saveShippingProfile("customer-a", { recipient_name: "Cliente de prueba", phone: "88887777", province: "San José", canton: "San José", district: "Carmen", exact_address: "Dirección de prueba" });
    expect(upsert).toHaveBeenCalledWith({ user_id: "customer-a", full_name: "Cliente de prueba", phone: "88887777", address: "Dirección de prueba, Carmen, San José, San José", shipping_phone: "88887777", shipping_province: "San José", shipping_canton: "San José", shipping_district: "Carmen", shipping_exact_address: "Dirección de prueba" }, { onConflict: "user_id" });
  });
  it("does not report success when saving fails", async () => {
    upsert.mockResolvedValue({ error: new Error("Save failed") });
    await expect(saveShippingProfile("customer-a", { recipient_name: "Cliente", phone: "88887777", province: "San José", canton: "San José", district: "Carmen", exact_address: "Dirección de prueba" })).rejects.toThrow("Save failed");
  });
});