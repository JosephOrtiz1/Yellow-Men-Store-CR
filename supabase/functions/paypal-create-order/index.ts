import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { CRC_PER_USD, json, paypal, paymentError, getUserId, adminClient } from '../_shared/paypal.ts';
import { trustedOrigin } from '../_shared/paymentRules.ts';

const BodySchema = z.object({ order_id: z.string().uuid(), return_origin: z.string().url().optional() });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const userId = await getUserId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: 'Invalid body' }, 400);

    const admin = adminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, total_colones, payment_status, payment_reference, archived_at, payment_environment, status')
      .eq('id', parsed.data.order_id)
      .maybeSingle();
    if (!order) return json({ error: 'Order not found' }, 404);
    if (order.user_id !== userId) return json({ error: 'Forbidden' }, 403);
    if (order.archived_at || order.payment_environment !== 'live' || order.status === 'cancelled') return json({ error: 'Order not payable' }, 409);
    if (order.payment_status === 'paid') return json({ error: 'Order already paid' }, 400);
    if (!Deno.env.get('PAYPAL_WEBHOOK_ID')) return json({ error: 'Live payment setup incomplete' }, 503);
    if (order.payment_reference) return json({ paypal_order_id: order.payment_reference });
    const origin = trustedOrigin(parsed.data.return_origin);
    const usd = (Number(order.total_colones) / CRC_PER_USD).toFixed(2);

    const data = await paypal('/v2/checkout/orders', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `create-${order.id}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: order.id,
          custom_id: order.id,
          description: `Yellow Men Store CR - Pedido ${order.id.slice(0, 8)}`,
          amount: { currency_code: 'USD', value: usd },
        }],
        application_context: {
          brand_name: 'Yellow Men Store CR',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${origin}/orders?paypal=return`,
          cancel_url: `${origin}/orders?paypal=cancel`,
        },
      }),
    });
    const approve = data.links?.find((l: { rel: string }) => l.rel === 'approve' || l.rel === 'payer-action')?.href;

    const { error: saveError } = await admin.from('orders').update({
      payment_provider: 'paypal',
      payment_reference: data.id,
      payment_checkout_url: approve,
    }).eq('id', order.id);
    if (saveError) return json({ error: 'Could not save payment reference' }, 500);

    return json({ checkout_url: approve, paypal_order_id: data.id, amount_usd: usd });
  } catch (err) {
    return paymentError(err);
  }
});
