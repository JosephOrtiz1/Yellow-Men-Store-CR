// Configuración de métodos de pago de la tienda.
export const SINPE_PHONE = "6488 3639";
export const SINPE_IBAN = "CR30015202001342380426";

export type PaymentMethod = "sinpe" | "card" | "paypal";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  sinpe: "SINPE Móvil",
  card: "Tarjeta",
  paypal: "PayPal",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};
