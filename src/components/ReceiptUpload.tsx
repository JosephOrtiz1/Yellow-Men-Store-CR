import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Receipt {
  id: string;
  image_path: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}

interface Props {
  orderId: string;
  onUploaded?: () => void;
}

export const ReceiptUpload = ({ orderId, onUploaded }: Props) => {
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("payment_receipts")
      .select("id, image_path, status, admin_note, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setReceipt((data?.[0] as Receipt | undefined) ?? null);
        setLoading(false);
      });
  }, [user, orderId]);

  const handleFile = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes", { position: "top-center" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen no puede superar 10 MB", { position: "top-center" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${user.id}/${orderId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, file, { cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data, error: insErr } = await supabase
        .from("payment_receipts")
        .insert({ order_id: orderId, user_id: user.id, image_path: path })
        .select("id, image_path, status, admin_note, created_at")
        .single();
      if (insErr) throw insErr;

      setReceipt(data as Receipt);
      onUploaded?.();
      toast.success("Comprobante enviado. Lo revisaremos pronto.", { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo subir el comprobante. Intenta de nuevo.", { position: "top-center" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;

  if (receipt) {
    const statusMap: Record<string, { label: string; icon: typeof Clock; className: string }> = {
      pending: { label: "Comprobante en revisión", icon: Clock, className: "text-muted-foreground" },
      approved: { label: "Comprobante aprobado", icon: CheckCircle2, className: "text-primary" },
      rejected: { label: "Comprobante rechazado", icon: XCircle, className: "text-destructive" },
    };
    const s = statusMap[receipt.status] ?? statusMap.pending;
    return (
      <div className="mt-3 space-y-2">
        <p className={`text-xs font-body flex items-center gap-1.5 ${s.className}`}>
          <s.icon className="w-4 h-4" /> {s.label}
        </p>
        {receipt.status === "rejected" && (
          <>
            {receipt.admin_note && (
              <p className="text-xs font-body text-destructive">Motivo: {receipt.admin_note}</p>
            )}
            <label className="inline-flex items-center gap-2 text-xs font-body text-primary underline cursor-pointer">
              <Upload className="w-3 h-3" /> Subir otro comprobante
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <label
        className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-xs font-body text-muted-foreground"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <>
            <Upload className="w-4 h-4 text-primary" />
            Arrastra o haz clic para subir tu comprobante SINPE
          </>
        )}
        <input type="file" accept="image/*" className="hidden" disabled={uploading}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
    </div>
  );
};
