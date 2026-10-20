import type { PaymentMethod } from './payments';

export function paymentExperience(method: PaymentMethod) {
  return method === 'card' ? 'card-fields' : method === 'paypal' ? 'account-popup' : 'manual';
}

export function isConfirmedCapture(result: { status?: string; order_id?: string } | null, orderId: string) {
  return result?.status === 'paid' && result.order_id === orderId;
}