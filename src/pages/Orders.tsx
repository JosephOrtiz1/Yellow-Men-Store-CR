import { useEffect, useState } from "react";
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
  status: string;
  items: OrderItem[];
  created_at: string;
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, total_colones, status, items, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as Order[]) || []);
        setLoading(false);
      });
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
                      <span className="text-xs px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground font-body uppercase">
                        {o.status}
                      </span>
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
