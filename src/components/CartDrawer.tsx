import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, LogIn } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart, clearCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = async () => {
    if (!user) {
      setIsOpen(false);
      toast.info("Inicia sesión para continuar con tu compra", { position: "top-center" });
      navigate("/auth", { state: { from: "/" } });
      return;
    }

    const checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl) return;

    setSaving(true);
    try {
      // Save order snapshot
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, address")
        .eq("user_id", user.id)
        .maybeSingle();

      const orderItems = items.map((it) => ({
        title: it.product.node.title,
        variantTitle: it.variantTitle,
        quantity: it.quantity,
        price: parseFloat(it.price.amount),
        image: it.product.node.images?.edges?.[0]?.node?.url,
      }));

      await supabase.from("orders").insert({
        user_id: user.id,
        items: orderItems,
        total_colones: totalPrice,
        status: "pending",
        contact_name: profile?.full_name ?? null,
        contact_email: profile?.email ?? user.email ?? null,
        contact_phone: profile?.phone ?? null,
        contact_address: profile?.address ?? null,
      });

      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to save order:", err);
      // proceed to checkout anyway
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
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
                    <div key={item.variantId} className="flex gap-4 p-3 border border-border rounded-sm">
                      <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body font-semibold text-sm truncate">{item.product.node.title}</h4>
                        <p className="text-xs text-muted-foreground font-body">{item.selectedOptions.map(o => o.value).join(' • ')}</p>
                        <p className="font-semibold text-sm mt-1">${parseFloat(item.price.amount).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation" onClick={() => removeItem(item.variantId)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8 touch-manipulation" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-body">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8 touch-manipulation" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-heading tracking-wider">TOTAL</span>
                  <span className="text-xl font-bold font-body">${totalPrice.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation" size="lg" disabled={items.length === 0 || isLoading || isSyncing || saving}>
                  {isLoading || isSyncing || saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : !user ? (
                    <><LogIn className="w-4 h-4 mr-2" />Iniciar sesión para pagar</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" />Pagar con Shopify</>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
