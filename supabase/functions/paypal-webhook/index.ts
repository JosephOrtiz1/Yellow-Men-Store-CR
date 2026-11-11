import { adminClient, json, paypal, paymentError } from '../_shared/paypal.ts';
import { verifiedCapture } from '../_shared/paymentRules.ts';

Deno.serve(async req => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
    if (!webhookId) return json({ error: 'Webhook not configured' }, 503);
    const event = await req.json();
    const fields = ['paypal-auth-algo', 'paypal-cert-url', 'paypal-transmission-id', 'paypal-transmission-sig', 'paypal-transmission-time'];
    if (fields.some(field => !req.headers.get(field))) return json({ error: 'Missing signature' }, 400);
    const result = await paypal('/v1/notifications/verify-webhook-signature', { method: 'POST', body: JSON.stringify({
      auth_algo: req.headers.get(fields[0]), cert_url: req.headers.get(fields[1]),
      transmission_id: req.headers.get(fields[2]), transmission_sig: req.headers.get(fields[3]),
      transmission_time: req.headers.get(fields[4]), webhook_id: webhookId, webhook_event: event,
    }) });
    if (result.verification_status !== 'SUCCESS') return json({ error: 'Invalid signature' }, 400);
    if (event.event_type !== 'PAYMENT.CAPTURE.COMPLETED') return json({ received: true });
    const paypalId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (typeof paypalId !== 'string' || !/^[A-Z0-9]{5,64}$/.test(paypalId)) return json({ error: 'Invalid order' }, 400);
    const admin = adminClient();
    const { data: order } = await admin.from('orders').select('id, total_colones, payment_status, archived_at, payment_environment').eq('payment_reference', paypalId).maybeSingle();
    if (!order || order.archived_at || order.payment_environment !== 'live') return json({ received: true });
    const verified = await paypal(`/v2/checkout/orders/${paypalId}`);
    if (!verifiedCapture(verified, order.id, Number(order.total_colones))) return json({ error: 'Payment mismatch' }, 400);
    const { error } = await admin.from('orders').update({ payment_status: 'paid' }).eq('id', order.id).eq('payment_status', 'unpaid');
    if (error) return json({ error: 'Could not save payment' }, 500);
    return json({ received: true });
  } catch (error) { return paymentError(error); }
});