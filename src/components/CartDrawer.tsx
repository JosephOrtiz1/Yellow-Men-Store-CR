import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Loader2, LogIn } from "lucide-react";
import { useCartStore, SHIPPING_COST_COLONES } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShippingDialog, OrderConfirmationDialog, type ShippingData } from "@/components/ShippingDialog";
import { formatColones } from "@/lib/supabaseProducts";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string | null; phone?: string | null; address?: string | null; email?: string | null } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.priceColones * item.quantity, 0);
  const shipping = items.length > 0 ? SHIPPING_COST_COLONES : 0;
  const totalPrice = subtotal + shipping;

  const openShipping = async () => {
    if (!user) {
      setIsOpen(false);
      toast.info("Inicia sesión para continuar con tu compra", { position: "top-center" });
      navigate("/auth", { state: { from: "/" } });
      return;
    }
    if (items.length === 0) return;
    // Prefill from profile
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone, address")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(data ?? null);
    setShippingOpen(true);
  };

  const handleConfirmShipping = async (shipping: ShippingData) => {
    if (!user) return;
    if (items.length === 0) return;
    setSaving(true);
    try {
      const orderItemsPayload = items.map((it) => ({
        product_id: it.productId,
        color: it.color ?? null,
        size: it.size ?? null,
        quantity: it.quantity,
      }));

      const { data: created, error: createErr } = await supabase.functions.invoke(
        "create-order",
        {
          body: {
            items: orderItemsPayload,
            shipping: {
              recipient_name: shipping.recipient_name,
              phone: shipping.phone,
              province: shipping.province,
              canton: shipping.canton,
              district: shipping.district,
              exact_address: shipping.exact_address,
            },
          },
        }
      );
      if (createErr || !created?.order_id) {
        const msg = (created as { error?: string } | null)?.error || createErr?.message;
        throw new Error(msg || "No se pudo registrar el pedido");
      }
      const orderId: string = created.order_id;
      setLastOrderId(orderId);

      const { data: payData, error: payError } = await supabase.functions.invoke(
        "paypal-create-order",
        { body: { order_id: orderId, return_origin: window.location.origin } }
      );

      setShippingOpen(false);
      setIsOpen(false);
      clearCart();

      if (payError || !payData?.checkout_url) {
        toast.info(
          "Pedido registrado, pero no se pudo abrir PayPal. Puedes reintentar el pago desde Mis pedidos.",
          { position: "top-center", duration: 6000 }
        );
        setConfirmOpen(true);
        return;
      }

      window.location.href = payData.checkout_url as string;
    } catch (err) {
      console.error("Failed to save order:", err);
      toast.error("No se pudo registrar tu pedido. Intenta de nuevo.", { position: "top-center" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground touch-manipulation">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl tracking-wider">CARRITO</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Tu carrito está vacío" : `${totalItems} artículo${totalItems !== 1 ? 's' : ''}`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-body">Tu carrito está vacío</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 border border-border rounded-sm">
                      <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body font-semibold text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground font-body">
                          {[item.color, item.size].filter(Boolean).join(" • ")}
                        </p>
                        <p className="font-semibold text-sm mt-1">{formatColones(item.priceColones)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8 touch-manipulation" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8 touch-manipulation" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t">
                <div className="space-y-1 text-sm font-body">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatColones(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío (Costa Rica)</span>
                    <span>{formatColones(shipping)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-lg font-heading tracking-wider">TOTAL</span>
                    <span className="text-xl font-bold font-body">{formatColones(totalPrice)}</span>
                  </div>
                </div>
                <Button onClick={openShipping} className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation" size="lg" disabled={items.length === 0 || saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : !user ? (
                    <><LogIn className="w-4 h-4 mr-2" />Iniciar sesión para pagar</>
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" />Pagar con tarjeta</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>

    <ShippingDialog
      open={shippingOpen}
      onOpenChange={setShippingOpen}
      onConfirm={handleConfirmShipping}
      saving={saving}
      defaultName={profile?.full_name ?? undefined}
      defaultPhone={profile?.phone ?? undefined}
      defaultAddress={profile?.address ?? undefined}
    />
    <OrderConfirmationDialog open={confirmOpen} onOpenChange={setConfirmOpen} orderId={lastOrderId} />
    </>
  );
};
