import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { PAYPAL_BASE, json, getPayPalToken, getUserId, adminClient } from '../_shared/paypal.ts';

const BodySchema = z.object({ paypal_order_id: z.string().min(5).max(64).regex(/^[A-Z0-9]+$/) });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const userId = await getUserId(req);
    if (!userId) return json({ error: 'Unauthorized' }, 401);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: 'Invalid body' }, 400);
    const ppId = parsed.data.paypal_order_id;

    const admin = adminClient();
    const { data: order } = await admin
      .from('orders')
      .select('id, user_id, payment_status')
      .eq('payment_reference', ppId)
      .maybeSingle();
    if (!order) return json({ error: 'Order not found' }, 404);
    if (order.user_id !== userId) return json({ error: 'Forbidden' }, 403);
    if (order.payment_status === 'paid') return json({ status: 'paid', order_id: order.id });

    const token = await getPayPalToken();
    if (!token) return json({ error: 'PayPal not configured' }, 503);

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${ppId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'COMPLETED') {
      console.error('paypal capture error', data);
      return json({ error: 'Payment not completed' }, 402);
    }

    const { error: saveError } = await admin.from('orders').update({ payment_status: 'paid', status: 'paid' }).eq('id', order.id);
    if (saveError) return json({ error: 'Payment captured but order update pending' }, 500);
    return json({ status: 'paid', order_id: order.id });
  } catch (err) {
    console.error(err);
    return json({ error: 'Internal error' }, 500);
  }
});
