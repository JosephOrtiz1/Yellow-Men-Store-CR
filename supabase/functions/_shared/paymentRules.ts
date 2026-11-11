export const PAYMENT_ENVIRONMENT = 'live';
export const CRC_PER_USD = 510;

export function trustedOrigin(input?: string) {
  const fallback = 'https://yellowmenstore.lovable.app';
  if (!input) return fallback;
  try {
    const url = new URL(input);
    const preview = url.hostname === 'id-preview--9123cd40-8743-49be-ba9a-3f07007e8707.lovable.app';
    return url.protocol === 'https:' && (url.hostname === 'yellowmenstore.lovable.app' || preview) ? url.origin : fallback;
  } catch { return fallback; }
}

export function verifiedCapture(data: any, orderId: string, total: number) {
  if (data?.status !== 'COMPLETED' || data.purchase_units?.length !== 1) return false;
  const unit = data.purchase_units[0];
  const captures = unit.payments?.captures;
  return unit.custom_id === orderId && unit.reference_id === orderId &&
    Array.isArray(captures) && captures.length === 1 && captures[0].status === 'COMPLETED' &&
    captures[0].amount?.currency_code === 'USD' &&
    captures[0].amount.value === (total / CRC_PER_USD).toFixed(2);
}