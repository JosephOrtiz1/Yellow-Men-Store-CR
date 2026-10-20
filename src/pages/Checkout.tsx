import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Copy, CreditCard, Loader2, LockKeyhole, ShoppingBag, Smartphone, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShippingDialog, type ShippingData } from "@/components/ShippingDialog";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { OrderProgressGuide } from "@/components/OrderProgressGuide";
import { PaymentSuccessModal } from "@/components/PaymentSuccessModal";
import { PayPalPayment } from "@/components/PayPalPayment";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore, SHIPPING_COST_COLONES } from "@/stores/cartStore";
import { SINPE_PHONE, SINPE_IBAN, type PaymentMethod } from "@/lib/payments";
import { formatColones } from "@/lib/supabaseProducts";

interface SavedShipping {
  full_name: string | null;
  phone: string | null;
  shipping_phone: string | null;
  shipping_province: string | null;
  shipping_canton: string | null;
  shipping_district: string | null;
  shipping_exact_address: string | null;
}

const methods = [
  { id: "sinpe", title: "SINPE Móvil / transferencia", icon: Smartphone, description: "Paga en colones al número SINPE o IBAN de la tienda. Sube el comprobante y espera nuestra revisión manual." },
  { id: "card", title: "Tarjeta de crédito o débito", icon: CreditCard, description: "Paga con Visa o Mastercard en los campos seguros de PayPal, sin salir de esta página." },
  { id: "paypal", title: "Cuenta PayPal", icon: Wallet, description: "Inicia sesión en PayPal y elige uno de los medios de pago disponibles en tu cuenta." },
] as const;

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [profile, setProfile] = useState<SavedShipping | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [shipping, setShipping] = useState<ShippingData | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("sinpe");
  const [step, setStep] = useState<"shipping" | "details" | "payment">("shipping");
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<{ id: string; total: number; method: PaymentMethod } | null>(null);
  const orderPromise = useRef<Promise<string> | null>(null);
  const [paid, setPaid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.priceColones * item.quantity, 0);
  const total = subtotal + (items.length ? SHIPPING_COST_COLONES : 0);

  useEffect(() => {
    if (order) clearCart();
  }, [order, clearCart]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase.from("profiles").select("full_name, phone, shipping_phone, shipping_province, shipping_canton, shipping_district, shipping_exact_address")
      .eq("user_id", user.id).maybeSingle().then(({ data, error }) => {
        if (!active) return;
        setProfile(data);
        setLoadingProfile(false);
        if (error) toast.info("No se pudieron cargar tus datos guardados. Puedes completar el envío aquí.");
      });
    return () => { active = false; };
  }, [user]);

  const ensureOrder = async (): Promise<string> => {
    if (order) return order.id;
    if (orderPromise.current) return orderPromise.current;
    if (!shipping || !user || !items.length) throw new Error("Completa el envío antes de pagar.");
    orderPromise.current = (async () => {
      setSaving(true);
      try {
      const { data, error } = await supabase.functions.invoke("create-order", {
        body: {
          items: items.map(item => ({ product_id: item.productId, color: item.color, size: item.size, quantity: item.quantity })),
          payment_method: method,
          shipping,
        },
      });
      if (error || !data?.order_id) throw new Error("No se pudo registrar tu pedido. Revisa los datos e inténtalo de nuevo.");
      setOrder({ id: data.order_id, total: Number(data.total_colones), method });
      return data.order_id as string;
      } catch (error) {
        orderPromise.current = null;
        throw error;
      } finally { setSaving(false); }
    })();
    return orderPromise.current;
  };

  const submitOrder = async () => {
    try { await ensureOrder(); setShowSuccess(true); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo continuar con el pago."); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Button asChild variant="ghost" className="pl-0 text-muted-foreground"><Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Seguir comprando</Link></Button>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-4 mb-8">
          <div><p className="text-primary text-sm font-semibold uppercase">Yellow Men Store CR</p><h1 className="font-heading text-5xl mt-1">FINALIZAR COMPRA</h1></div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole className="w-4 h-4" />Tus datos de pago se procesan de forma segura</p>
        </div>
        <ol aria-label="Pasos de compra" className="grid grid-cols-4 border-y border-border py-5 mb-10 gap-3">
          {["Envío", "Detalles", "Pago", "Confirmación"].map((label, index) => {
            const current = order ? 3 : step === "payment" ? 2 : step === "details" ? 1 : 0;
            return <li key={label} aria-current={current === index ? "step" : undefined} className={`flex items-center gap-2 text-sm ${index <= current ? "text-primary" : "text-muted-foreground"}`}><span className="flex items-center justify-center border border-current rounded-full w-7 h-7 shrink-0">{index < current ? <Check className="w-4 h-4" /> : index + 1}</span><span>{label}</span></li>;
          })}
        </ol>
        {!items.length && !order ? (
          <div className="py-16 text-center"><ShoppingBag className="w-12 h-12 text-primary mx-auto mb-4" /><h2 className="font-heading text-3xl">TU CARRITO ESTÁ VACÍO</h2><Button asChild className="mt-6"><Link to="/">Ver productos</Link></Button></div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 lg:gap-16 items-start">
            <div className="min-w-0 space-y-10">
              {order ? (
                <section className="space-y-5">
                  <h2 className="font-heading text-3xl">PEDIDO REGISTRADO</h2>
                  <p className="text-muted-foreground">{paid ? "PayPal confirmó tu pago. Recibirás las actualizaciones de tu pedido en tu cuenta." : "Registrar el pedido no significa que ya esté pagado. Guarda una foto de tu ID y del comprobante para cualquier consulta por Instagram."}</p>
                  <div className="flex flex-wrap gap-3 items-center border-y border-border py-5"><strong className="font-heading text-3xl text-primary">#{order.id.slice(0, 8).toUpperCase()}</strong><Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(order.id.slice(0, 8).toUpperCase()); toast.success("ID copiado"); } catch { toast.error("No se pudo copiar el ID"); } }}><Copy className="w-4 h-4 mr-2" />Copiar ID</Button></div>
                  {order.method === "sinpe" ? <>
                    <h3 className="font-heading text-2xl">COMPLETA TU PAGO POR SINPE</h3>
                    <p>Transfiere <strong className="text-primary">{formatColones(order.total)}</strong> y adjunta tu comprobante.</p>
                    <dl className="space-y-4 bg-muted/40 p-5 rounded-lg"><div><dt className="text-sm text-muted-foreground">SINPE Móvil</dt><dd className="text-xl font-semibold">{SINPE_PHONE}</dd></div><div><dt className="text-sm text-muted-foreground">IBAN para transferencia</dt><dd className="font-semibold break-all">{SINPE_IBAN}</dd></div></dl>
                    <ReceiptUpload orderId={order.id} />
                    <p className="text-sm text-muted-foreground">El pago queda pendiente hasta que aprobemos el comprobante. Recibirás una notificación con la actualización.</p>
                  </> : <p role="status" className={paid ? "text-primary font-semibold" : "text-muted-foreground"}>{paid ? "PAGO CONFIRMADO" : "Pago pendiente: completa la autorización a continuación."}</p>}
                  <Button asChild variant="outline"><Link to="/orders">Ver Mis pedidos<ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
                </section>
              ) : step === "shipping" ? (
                loadingProfile ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <ShippingDialog inline open onOpenChange={() => navigate("/")} saving={saving} onConfirm={async data => { setShipping(data); setStep("details"); window.scrollTo({ top: 0, behavior: "smooth" }); }} defaultName={shipping?.recipient_name ?? profile?.full_name ?? undefined} defaultPhone={shipping?.phone ?? profile?.shipping_phone ?? profile?.phone ?? undefined} defaultAddress={shipping?.exact_address ?? profile?.shipping_exact_address ?? undefined} defaultProvince={shipping?.province ?? profile?.shipping_province ?? undefined} defaultCanton={shipping?.canton ?? profile?.shipping_canton ?? undefined} defaultDistrict={shipping?.district ?? profile?.shipping_district ?? undefined} />
              ) : step === "details" ? (
                <section className="space-y-6" aria-label="Detalles de la compra">
                  <div><h2 className="font-heading text-3xl">DETALLES DE LA COMPRA</h2><p className="text-muted-foreground mt-2">Revisa los artículos, el subtotal y el total antes de pasar al pago.</p></div>
                  <ul className="space-y-4 border border-border rounded-lg p-5">{items.map(item => <li key={item.id} className="flex gap-3">{item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-16 h-20 object-cover rounded shrink-0" />}<div className="min-w-0 flex-1"><p className="font-semibold break-words">{item.title}</p><p className="text-xs text-muted-foreground mt-1">{[item.color, item.size].filter(Boolean).join(" · ")} · × {item.quantity}</p></div><p className="text-sm font-semibold shrink-0">{formatColones(item.priceColones * item.quantity)}</p></li>)}</ul>
                  <dl className="text-sm space-y-3 border-y border-border py-5">
                    <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatColones(subtotal)}</dd></div>
                    <div className="flex justify-between"><dt>Envío nacional</dt><dd>{formatColones(SHIPPING_COST_COLONES)}</dd></div>
                    <div className="flex justify-between text-lg font-semibold border-t border-border pt-4"><dt>Total</dt><dd className="text-primary">{formatColones(total)}</dd></div>
                  </dl>
                  <div className="border-y border-border py-5 space-y-2"><div className="flex justify-between gap-3"><h3 className="font-body font-semibold">Entregar a</h3><Button variant="link" className="h-auto p-0" onClick={() => { setStep("shipping"); }}>Editar</Button></div><p>{shipping.recipient_name} · {shipping.phone}</p><p className="text-sm text-muted-foreground">{shipping.province}, {shipping.canton}, {shipping.district}<br />{shipping.exact_address}</p></div>
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => { setStep("payment"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Continuar al pago<ArrowRight className="w-4 h-4 ml-2" /></Button>
                </section>
              ) : (
                <section className="space-y-6">
                  <div><h2 className="font-heading text-3xl">ELIGE CÓMO PAGAR</h2><p className="text-muted-foreground mt-2">Revisa el método antes de registrar tu pedido. No se realizará ningún cobro al seleccionar una opción.</p></div>
                  <RadioGroup value={method} onValueChange={value => setMethod(value as PaymentMethod)} disabled={saving} className="gap-3">
                    {methods.map(({ id, title, description, icon: Icon }) => <label key={id} htmlFor={`payment-${id}`} className={`flex gap-4 p-5 border rounded-lg cursor-pointer transition-colors ${method === id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}><Icon className="w-6 h-6 text-primary shrink-0" /><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="block text-sm text-muted-foreground leading-relaxed mt-1">{description}</span></span><RadioGroupItem id={`payment-${id}`} value={id} aria-label={title} className="shrink-0 mt-1" /></label>)}
                  </RadioGroup>
                  <div className="flex justify-between gap-3 border-y border-border py-5"><div><h3 className="font-body font-semibold">Entregar a</h3><p className="mt-1">{shipping.recipient_name} · {shipping.phone}</p><p className="text-sm text-muted-foreground">{shipping.province}, {shipping.canton}, {shipping.district}<br />{shipping.exact_address}</p></div><Button variant="link" className="h-auto p-0 shrink-0" disabled={saving} onClick={() => setStep("details")}>Editar</Button></div>
                  <div className="flex justify-between text-lg font-semibold border-b border-border pb-5"><dt>Total a pagar</dt><dd className="text-primary">{formatColones(total)}</dd></div>
                  {method === "sinpe" && <Button size="lg" disabled={saving} className="w-full sm:w-auto" onClick={submitOrder}>{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LockKeyhole className="w-4 h-4 mr-2" />}Registrar pedido y subir comprobante</Button>}
                  <Button variant="outline" disabled={saving} className="w-full sm:w-auto" onClick={() => setStep("details")}>Volver a los detalles</Button>
                </section>
              )}
              {(step === "payment" || order) && shipping && !paid && (order?.method ?? method) !== "sinpe" && <PayPalPayment method={(order?.method ?? method) === "card" ? "card" : "paypal"} total={order?.total ?? total} ensureOrder={ensureOrder} onPaid={() => { setPaid(true); setShowSuccess(true); toast.success("Pago confirmado por PayPal"); }} />}
              {order && <PaymentSuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} orderId={order.id} total={order.total} paid={order.method === "sinpe" ? false : paid} method={order.method} />}
              <OrderProgressGuide />
            </div>
            <aside aria-label="Resumen de compra" className="border border-border bg-card rounded-lg p-6 lg:sticky lg:top-24 min-w-0">
              <h2 className="font-heading text-2xl mb-5">{order ? "RESUMEN DEL PEDIDO" : "TU COMPRA"}</h2>
              {!order && <ul className="space-y-4 mb-6">{items.map(item => <li key={item.id} className="flex gap-3">{item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-16 h-20 object-cover rounded shrink-0" />}<div className="min-w-0"><p className="font-semibold break-words">{item.title}</p><p className="text-xs text-muted-foreground mt-1">{[item.color, item.size].filter(Boolean).join(" · ")} · × {item.quantity}</p><p className="text-sm mt-1">{formatColones(item.priceColones * item.quantity)}</p></div></li>)}</ul>}
              <dl className="text-sm space-y-3 border-t border-border pt-5">{!order && <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatColones(subtotal)}</dd></div>}<div className="flex justify-between"><dt>Envío nacional</dt><dd>{formatColones(SHIPPING_COST_COLONES)}</dd></div><div className="flex justify-between text-lg font-semibold border-t border-border pt-4"><dt>Total</dt><dd className="text-primary">{formatColones(order?.total ?? total)}</dd></div></dl>
              <div className="flex gap-3 mt-6 pt-5 border-t border-border"><Truck className="w-5 h-5 shrink-0 text-primary" /><p className="text-sm text-muted-foreground">Solo Costa Rica.<br /><strong className="text-foreground">15 a 30 días hábiles.</strong><br />Entrega por Correos de Costa Rica.</p></div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;