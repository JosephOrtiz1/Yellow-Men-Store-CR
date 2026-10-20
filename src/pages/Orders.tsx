import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  variantTitle?: string;
  image?: string;
}

interface Order {
  id: string;
  total_colones: number;
  subtotal_colones?: number;
  shipping_cost_colones?: number;
  status: string;
  payment_status?: string;
  payment_checkout_url?: string | null;
  items: OrderItem[];
  created_at: string;
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    if (!user) return;
    const load = () =>
      supabase
        .from("orders")
        .select("id, total_colones, subtotal_colones, shipping_cost_colones, status, payment_status, payment_checkout_url, items, created_at")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setOrders((data as unknown as Order[]) || []);
          setLoading(false);
        });

    const flow = params.get("paypal");
    const token = params.get("token");
    if (flow === "return" && token) {
      supabase.functions
        .invoke("paypal-capture-order", { body: { paypal_order_id: token } })
        .then(({ data, error }) => {
          if (error || data?.status !== "paid") toast.error("El pago no se completó. Intenta de nuevo.");
          else toast.success(`¡Pago confirmado! Guarda tu ID de pedido: ${String(data.order_id).slice(0, 8)}`, { duration: 10000 });
          setParams({}, { replace: true });
          load();
        });
    } else {
      if (flow === "cancel") {
        toast.info("Pago cancelado. Puedes reintentarlo cuando quieras.");
        setParams({}, { replace: true });
      }
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-heading text-4xl tracking-wider mb-6">MIS PEDIDOS</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-2">
              <Package className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="font-body text-muted-foreground">Aún no tienes pedidos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-heading text-lg tracking-wider">
                        Pedido #{o.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-body">
                        {new Date(o.created_at).toLocaleString("es-CR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-body font-bold text-primary">
                        ₡{Math.round(Number(o.total_colones)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                      </p>
                      <div className="flex gap-1 justify-end mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground font-body uppercase">
                          {o.status}
                        </span>
                        {o.payment_status && (
                          <span className={`text-xs px-2 py-0.5 rounded-sm font-body uppercase ${o.payment_status === 'paid' ? 'bg-primary/20 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                            {o.payment_status === 'paid' ? 'Pagado' : 'Sin pagar'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(o.items || []).map((it, i) => (
                      <li key={i} className="flex justify-between text-sm font-body">
                        <span className="truncate">
                          {it.title} {it.variantTitle ? `(${it.variantTitle})` : ""} × {it.quantity}
                        </span>
                        <span className="text-muted-foreground">
                          ₡{Math.round(Number(it.price) * it.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {o.shipping_cost_colones != null && (
                    <p className="text-xs text-muted-foreground font-body mt-3 pt-3 border-t border-border">
                      Envío: ₡{Math.round(Number(o.shipping_cost_colones)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                    </p>
                  )}
                  {o.payment_status !== 'paid' && o.payment_checkout_url && (
                    <a
                      href={o.payment_checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm font-body text-primary underline"
                    >
                      Continuar al pago →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
