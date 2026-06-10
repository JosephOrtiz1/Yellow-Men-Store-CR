import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  order_id: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Invalid body', details: parsed.error.flatten() }, 400);
    }

    // Load the order (RLS already restricts to owner)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_colones, contact_email, contact_name, contact_phone, items')
      .eq('id', parsed.data.order_id)
      .maybeSingle();

    if (orderError || !order) {
      return json({ error: 'Order not found' }, 404);
    }
    if (order.user_id !== userId) {
      return json({ error: 'Forbidden' }, 403);
    }

    // Check Tilopay credentials
    const apiUser = Deno.env.get('TILOPAY_API_USER');
    const apiPassword = Deno.env.get('TILOPAY_API_PASSWORD');
    const apiKey = Deno.env.get('TILOPAY_API_KEY');
    const publicSiteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://yellowmenstore.lovable.app';

    if (!apiUser || !apiPassword || !apiKey) {
      return json({
        error: 'Payment gateway not configured. Tilopay credentials missing.',
        configured: false,
      }, 503);
    }

    // Tilopay v1 SDK requires an auth token via /loginSdk first
    const loginRes = await fetch('https://app.tilopay.com/api/v1/loginSdk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiuser: apiUser, password: apiPassword, key: apiKey }),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok || !loginData?.access_token) {
      console.error('Tilopay login failed', loginData);
      return json({ error: 'Could not authenticate with payment gateway' }, 502);
    }

    const amountUsd = (Number(order.total_colones) / 600).toFixed(2); // Tilopay processes in USD by default; CRC supported on some accounts
    const payload = {
      redirect: `${publicSiteUrl}/orders?order=${order.id}`,
      key: apiKey,
      amount: String(order.total_colones),
      currency: 'CRC',
      billToFirstName: (order.contact_name || 'Cliente').split(' ')[0],
      billToLastName: (order.contact_name || 'YMS').split(' ').slice(1).join(' ') || 'YMS',
      billToAddress: 'Costa Rica',
      billToAddress2: '',
      billToCity: 'San Jose',
      billToState: 'SJ',
      billToZipPostCode: '10101',
      billToCountry: 'CR',
      billToTelephone: order.contact_phone || '0',
      billToEmail: order.contact_email || 'no-reply@yellowmenstore.com',
      orderNumber: order.id,
      capture: '1',
      subscription: '0',
      platform: 'api',
      returnData: btoa(JSON.stringify({ order_id: order.id })),
    };

    const payRes = await fetch('https://app.tilopay.com/api/v1/processPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.access_token}`,
      },
      body: JSON.stringify(payload),
    });
    const payData = await payRes.json().catch(() => ({}));
    if (!payRes.ok || !payData?.url) {
      console.error('Tilopay processPayment failed', payData);
      return json({ error: 'Could not create checkout', details: payData }, 502);
    }

    // Persist payment reference & checkout URL with service role
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    await admin
      .from('orders')
      .update({
        payment_provider: 'tilopay',
        payment_reference: payData.reference || null,
        payment_checkout_url: payData.url,
      })
      .eq('id', order.id);

    return json({ checkout_url: payData.url, reference: payData.reference || null });
  } catch (err) {
    console.error('tilopay-create-payment error', err);
    return json({ error: 'Internal error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}