import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { json, paypal, paymentError, getUserId, adminClient } from '../_shared/paypal.ts';
import { verifiedCapture } from '../_shared/paymentRules.ts';

const BodySchema = z.object({ paypal_order_id: z.string().min(5).max(64).regex(/^[A-Z0-9]+$/) });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const userId = await getUserId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: 'Invalid body' }, 400);
    const ppId = parsed.data.paypal_order_id;

    const admin = adminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, payment_status, total_colones, archived_at, payment_environment, status')
      .eq('payment_reference', ppId)
      .maybeSingle();
    if (!order) return json({ error: 'Order not found' }, 404);
    if (order.user_id !== userId) return json({ error: 'Forbidden' }, 403);
    if (order.archived_at || order.payment_environment !== 'live' || order.status === 'cancelled') return json({ error: 'Order not payable' }, 409);
    if (order.payment_status === 'paid') return json({ status: 'paid', order_id: order.id });

    if (!Deno.env.get('PAYPAL_WEBHOOK_ID')) return json({ error: 'Live payment setup incomplete' }, 503);
    let data = await paypal(`/v2/checkout/orders/${ppId}`);
    if (data.status !== 'COMPLETED') data = await paypal(`/v2/checkout/orders/${ppId}/capture`, {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `capture-${order.id}` },
    });
    if (!verifiedCapture(data, order.id, Number(order.total_colones))) {
      return json({ error: 'Payment not completed' }, 402);
    }
    // Only the signature-verified webhook may change the stored payment status.
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: saved } = await admin.from('orders').select('payment_status').eq('id', order.id).single();
      if (saved?.payment_status === 'paid') return json({ status: 'paid', order_id: order.id });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return json({ status: 'pending', order_id: order.id });
  } catch (err) {
    return paymentError(err);
  }
});
