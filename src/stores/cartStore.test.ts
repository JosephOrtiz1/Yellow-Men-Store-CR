import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "./cartStore";

const item = { id: "product-a:Negro:M", productId: "product-a", title: "Camisa", handle: "camisa", imageUrl: null, color: "Negro", size: "M", priceColones: 10000 };

describe("individual purchase", () => {
  beforeEach(() => useCartStore.setState({ items: [], buyNowItem: null }));
  it("buys one selected item without including existing cart quantities", () => {
    useCartStore.getState().addItem({ ...item, quantity: 3 });
    useCartStore.getState().startBuyNow(item);
    expect(useCartStore.getState().buyNowItem).toEqual({ ...item, quantity: 1 });
    expect(useCartStore.getState().items).toEqual([{ ...item, quantity: 3 }]);
  });
  it("leaves the cart intact when the individual purchase is cleared", () => {
    useCartStore.getState().addItem({ ...item, quantity: 2 });
    useCartStore.getState().startBuyNow(item);
    useCartStore.getState().clearBuyNow();
    expect(useCartStore.getState().buyNowItem).toBeNull();
    expect(useCartStore.getState().items).toEqual([{ ...item, quantity: 2 }]);
  });
});