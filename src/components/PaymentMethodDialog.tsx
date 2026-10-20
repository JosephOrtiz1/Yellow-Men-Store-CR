import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Smartphone, CreditCard, Wallet, Loader2 } from "lucide-react";
import type { PaymentMethod } from "@/lib/payments";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: PaymentMethod) => void;
  loading: boolean;
  totalColones: number;
}

const METHODS: { id: PaymentMethod; title: string; description: string; icon: typeof Smartphone }[] = [
  {
    id: "sinpe",
    title: "SINPE Móvil",
    description: "Transfiere al 6488 3639 (o IBAN CR30015202001342380426) y sube tu comprobante. Lo confirmamos manualmente.",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Tarjeta",
    description: "Paga con tarjeta de crédito o débito de forma segura a través de PayPal.",
    icon: CreditCard,
  },
  {
    id: "paypal",
    title: "Cuenta PayPal",
    description: "Paga con el saldo de tu cuenta PayPal.",
    icon: Wallet,
  },
];

export const PaymentMethodDialog = ({ open, onOpenChange, onSelect, loading, totalColones }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md rounded-2xl">
      <DialogHeader>
        <DialogTitle className="font-heading text-2xl tracking-wider">MÉTODO DE PAGO</DialogTitle>
        <DialogDescription className="font-body">
          Total a pagar: <strong className="text-primary">₡{Math.round(totalColones).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</strong>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={loading}
            onClick={() => onSelect(m.id)}
            className="w-full flex items-start gap-3 p-4 border border-border rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 touch-manipulation"
          >
            <m.icon className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <span className="flex-1 min-w-0">
              <span className="block font-body font-semibold text-sm">{m.title}</span>
              <span className="block font-body text-xs text-muted-foreground mt-0.5">{m.description}</span>
            </span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />}
          </button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
