import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Truck, Info, Copy, Instagram, Camera } from "lucide-react";
import { toast } from "sonner";

export interface ShippingData {
  recipient_name: string;
  province: string;
  canton: string;
  district: string;
  exact_address: string;
  phone: string;
}

const shippingSchema = z.object({
  recipient_name: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  province: z.string().trim().min(2, "Requerido").max(60),
  canton: z.string().trim().min(2, "Requerido").max(60),
  district: z.string().trim().min(2, "Requerido").max(60),
  exact_address: z.string().trim().min(5, "Mínimo 5 caracteres").max(300),
  phone: z.string().trim().regex(/^\d{8}$/, "Debe tener exactamente 8 dígitos"),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ShippingData) => Promise<void>;
  saving: boolean;
  defaultName?: string;
  defaultPhone?: string;
  defaultAddress?: string;
}

export const ShippingDialog = ({ open, onOpenChange, onConfirm, saving, defaultName, defaultPhone, defaultAddress }: Props) => {
  const [form, setForm] = useState<ShippingData>({
    recipient_name: defaultName ?? "",
    province: "",
    canton: "",
    district: "",
    exact_address: defaultAddress ?? "",
    phone: defaultPhone ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});
  const [acknowledged, setAcknowledged] = useState(false);

  const set = <K extends keyof ShippingData>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = shippingSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ShippingData, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ShippingData;
        fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (!acknowledged) {
      toast.error("Debes confirmar que entendiste las condiciones de envío", { position: "top-center" });
      return;
    }
    await onConfirm(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-wider flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> DATOS DE ENVÍO
          </DialogTitle>
          <DialogDescription className="font-body">
            Completa los datos para que tu pedido llegue correctamente.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-primary/40 bg-primary/5 rounded-xl">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="font-body text-xs leading-relaxed">
            <strong className="block mb-1">⚠️ Solo realizamos envíos dentro de Costa Rica.</strong>
            Tu pedido tarda <strong>de 15 a 30 días hábiles</strong> en llegar.
            La entrega es a través de <strong>Correos de Costa Rica</strong>.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="font-body text-xs uppercase tracking-wide">Nombre de quien recolecta</Label>
            <Input className="rounded-xl" value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} placeholder="Juan Pérez" maxLength={100} />
            {errors.recipient_name && <p className="text-xs text-destructive mt-1 font-body">{errors.recipient_name}</p>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Provincia</Label>
              <Input className="rounded-xl" value={form.province} onChange={(e) => set("province", e.target.value)} placeholder="San José" maxLength={60} />
              {errors.province && <p className="text-xs text-destructive mt-1 font-body">{errors.province}</p>}
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Cantón</Label>
              <Input className="rounded-xl" value={form.canton} onChange={(e) => set("canton", e.target.value)} placeholder="Escazú" maxLength={60} />
              {errors.canton && <p className="text-xs text-destructive mt-1 font-body">{errors.canton}</p>}
            </div>
            <div>
              <Label className="font-body text-xs uppercase tracking-wide">Distrito</Label>
              <Input className="rounded-xl" value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="San Rafael" maxLength={60} />
              {errors.district && <p className="text-xs text-destructive mt-1 font-body">{errors.district}</p>}
            </div>
          </div>

          <div>
            <Label className="font-body text-xs uppercase tracking-wide">Dirección exacta</Label>
            <Input className="rounded-xl" value={form.exact_address} onChange={(e) => set("exact_address", e.target.value)} placeholder="200m sur de la iglesia, casa amarilla" maxLength={300} />
            {errors.exact_address && <p className="text-xs text-destructive mt-1 font-body">{errors.exact_address}</p>}
          </div>

          <div>
            <Label className="font-body text-xs uppercase tracking-wide">Teléfono (8 dígitos)</Label>
            <Input
              className="rounded-xl"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="88887777"
              maxLength={8}
            />
            {errors.phone && <p className="text-xs text-destructive mt-1 font-body">{errors.phone}</p>}
          </div>

          <label className="flex items-start gap-2 text-xs font-body cursor-pointer p-3 border border-border rounded-xl hover:bg-muted/40">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <span>
              Confirmo que entiendo que el envío solo aplica para Costa Rica, tarda <strong>15 a 30 días hábiles</strong>, y se realiza por <strong>Correos de Costa Rica</strong>.
            </span>
          </label>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continuar al pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface OrderConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

export const OrderConfirmationDialog = ({ open, onOpenChange, orderId }: OrderConfirmProps) => {
  if (!orderId) return null;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const igMessage = encodeURIComponent(`Hola! Quiero consultar por mi pedido #${shortId}`);

  const copyId = () => {
    navigator.clipboard.writeText(shortId);
    toast.success("ID copiado", { position: "top-center" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl tracking-wider">¡PEDIDO REGISTRADO!</DialogTitle>
          <DialogDescription className="font-body">
            Tu pedido fue creado correctamente. Guarda este ID, lo necesitarás para cualquier consulta.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-primary/10 border-2 border-primary rounded-2xl p-6 text-center">
          <p className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1">ID DE PEDIDO</p>
          <p className="font-heading text-4xl tracking-widest text-primary">#{shortId}</p>
          <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={copyId}>
            <Copy className="w-3 h-3 mr-1" /> Copiar
          </Button>
        </div>

        <Alert className="border-primary/40 bg-muted/40 rounded-xl">
          <Camera className="h-4 w-4" />
          <AlertDescription className="font-body text-xs leading-relaxed">
            <strong>Importante:</strong> Tómale una foto o anota tu <strong>ID de pedido</strong> y guarda también el <strong>comprobante de pago</strong> que te entrega Shopify. Los necesitarás si algo ocurre con tu envío.
          </AlertDescription>
        </Alert>

        <Alert className="border-primary/40 bg-primary/5 rounded-xl">
          <Truck className="h-4 w-4 text-primary" />
          <AlertDescription className="font-body text-xs leading-relaxed">
            Tu pedido tarda <strong>15 a 30 días hábiles</strong> en llegar vía <strong>Correos de Costa Rica</strong>.
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button asChild variant="outline" className="rounded-xl">
            <a href={`https://ig.me/m/yellowmen.store?text=${igMessage}`} target="_blank" rel="noopener noreferrer">
              <Instagram className="w-4 h-4 mr-2" /> Consultar por IG
            </a>
          </Button>
          <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};