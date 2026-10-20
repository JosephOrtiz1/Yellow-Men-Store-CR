import { CheckCircle2, Clock, Package, Truck } from "lucide-react";

const steps = [
  { title: "Pendiente de pago", description: "Tu pedido está registrado, pero el pago todavía no ha sido confirmado.", icon: Clock },
  { title: "Pago confirmado", description: "En SINPE revisamos tu comprobante. Con PayPal o tarjeta, confirmamos cuando PayPal completa el cobro.", icon: CheckCircle2 },
  { title: "Pedido confirmado", description: "La tienda ha confirmado tu pedido. Aún no significa que haya sido enviado.", icon: Package },
  { title: "Enviado y entregado", description: "Enviado: tu pedido está en camino con Correos de Costa Rica. Entregado: se ha completado la entrega.", icon: Truck },
];

export const OrderProgressGuide = () => (
  <section aria-label="Significado de los estados del pedido" className="border-t border-border pt-6">
    <h2 className="font-heading text-2xl">¿QUÉ SIGUE CON TU PEDIDO?</h2>
    <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mt-5">
      {steps.map(({ title, description, icon: Icon }, index) => (
        <li key={title} className="flex gap-3">
          <Icon className="w-5 h-5 shrink-0 text-primary mt-1" />
          <div>
            <h3 className="font-body font-semibold text-sm">{index + 1}. {title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </li>
      ))}
    </ol>
    <p className="text-sm text-muted-foreground mt-5">Comprobante en revisión: todavía no está aprobado. Rechazado: revisa el motivo y sube otro comprobante. Cancelado: el pedido no continuará. Las actualizaciones aparecen en Mis pedidos y en tus notificaciones.</p>
  </section>
);