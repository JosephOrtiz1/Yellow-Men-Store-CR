import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Home, Package, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatColones } from "@/lib/supabaseProducts";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payments";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  total?: number;
  paid: boolean;
  method?: PaymentMethod | null;
};

export const PaymentSuccessModal = ({ open, onClose, orderId, total, paid, method }: Props) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(orderId.slice(0, 8).toUpperCase());
      setCopied(true);
      toast.success("ID copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el ID");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={paid ? "Pago confirmado" : "Pedido registrado"}
      className="success-overlay fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="success-card relative w-full max-w-md border border-border bg-card p-8 text-center"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-sm p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <svg viewBox="0 0 104 104" className="mx-auto w-24 h-24 text-primary" fill="none" aria-hidden="true">
          <circle cx="52" cy="52" r="46" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="success-circle" />
          <path d="M32 52 L46 66 L72 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="success-check" />
        </svg>

        <h2 className="font-heading text-4xl tracking-wider mt-5">
          {paid ? "¡PAGO CONFIRMADO!" : "¡PEDIDO REGISTRADO!"}
        </h2>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {paid
            ? "Tu pago fue confirmado por PayPal. Aquí puedes ver tu pedido y seguir su estado hasta la entrega."
            : "Tu pedido quedó registrado. Sube tu comprobante de SINPE para que confirmemos el pago y preparemos el envío."}
        </p>

        <div className="flex items-center justify-center gap-3 mt-6 border-y border-border py-4">
          <Package className="w-5 h-5 text-primary shrink-0" />
          <span className="font-heading text-2xl tracking-wider">#{orderId.slice(0, 8).toUpperCase()}</span>
          <Button variant="ghost" size="sm" onClick={copyId} aria-label="Copiar ID del pedido">
            <Copy className="w-4 h-4" />
            <span className="sr-only">{copied ? "Copiado" : "Copiar ID"}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className={`px-2 py-0.5 rounded-sm uppercase font-body ${paid ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {paid ? "Pagado" : "Pendiente de pago"}
          </span>
          {method && (
            <span className="px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground uppercase font-body">
              {PAYMENT_METHOD_LABELS[method] ?? method}
            </span>
          )}
          {typeof total === "number" && total > 0 && (
            <span className="px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground uppercase font-body">
              Total {formatColones(total)}
            </span>
          )}
        </div>

        <div className="grid gap-3 mt-7">
          <Button asChild size="lg">
            <Link to="/orders"><Package className="w-4 h-4 mr-2" />Ver mi pedido y su estado</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/"><Home className="w-4 h-4 mr-2" />Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
