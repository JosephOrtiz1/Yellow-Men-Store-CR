import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const SHIPPING_COST_COLONES = 3000;

const ItemSchema = z.object({
  product_id: z.string().uuid(),
  color: z.string().max(100).nullable().optional(),
  size: z.string().max(50).nullable().optional(),
  quantity: z.number().int().min(1).max(50),
});

const ShippingSchema = z.object({
  recipient_name: z.string().trim().min(1).max(150),
  phone: z.string().trim().min(1).max(50),
  province: z.string().trim().min(1).max(100),
  canton: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  exact_address: z.string().trim().min(1).max(500),
});

const BodySchema = z.object({
  items: z.array(ItemSchema).min(1).max(50),
  shipping: ShippingSchema,
  payment_method: z.enum(['sinpe', 'card', 'paypal']),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const userId = claims.claims.sub as string;
    const userEmail = (claims.claims.email as string | undefined) ?? null;

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return json({ error: 'Invalid body', details: parsed.error.flatten() }, 400);
    }
    const { items, shipping, payment_method } = parsed.data;

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch authoritative product data
    const productIds = Array.from(new Set(items.map((i) => i.product_id)));
    const { data: products, error: productsError } = await admin
      .from('products')
      .select('id, title, price_colones, is_active, deleted_at, available')
      .in('id', productIds);

    if (productsError) {
      console.error('products fetch error', productsError);
      return json({ error: 'Could not load products' }, 500);
    }

    const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
    for (const it of items) {
      const p = productMap.get(it.product_id);
      if (!p || !p.is_active || p.deleted_at || !p.available) {
        return json({ error: `Product unavailable: ${it.product_id}` }, 400);
      }
    }

    // Validate that color (if provided) exists and is available
    if (items.some((i) => i.color)) {
      const { data: colors } = await admin
        .from('product_colors')
        .select('product_id, color_name, available')
        .in('product_id', productIds);
      const colorKey = (pid: string, name: string) => `${pid}::${name.toLowerCase()}`;
      const colorMap = new Map(
        (colors ?? []).map((c) => [colorKey(c.product_id, c.color_name), c])
      );
      for (const it of items) {
        if (!it.color) continue;
        const c = colorMap.get(colorKey(it.product_id, it.color));
        if (!c || !c.available) {
          return json({ error: `Color unavailable for product ${it.product_id}` }, 400);
        }
      }
    }

    // Server-side total calculation using authoritative prices
    let subtotal = 0;
    const orderItems = items.map((it) => {
      const p = productMap.get(it.product_id)!;
      const price = Number(p.price_colones);
      subtotal += price * it.quantity;
      return {
        product_id: it.product_id,
        title: p.title,
        color: it.color ?? null,
        size: it.size ?? null,
        variantTitle: [it.color, it.size].filter(Boolean).join(' / '),
        quantity: it.quantity,
        price,
      };
    });
    const shippingCost = SHIPPING_COST_COLONES;
    const total = subtotal + shippingCost;

    // Load profile email/full name (best effort)
    const { data: profile } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .maybeSingle();

    const contactEmail = profile?.email ?? userEmail;

    const { data: inserted, error: insertError } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        items: orderItems,
        subtotal_colones: subtotal,
        shipping_cost_colones: shippingCost,
        total_colones: total,
        status: 'pending',
        payment_status: 'unpaid',
        payment_method,
        payment_provider: payment_method === 'sinpe' ? 'sinpe' : 'paypal',
        contact_name: shipping.recipient_name,
        contact_email: contactEmail,
        contact_phone: shipping.phone,
        contact_address: `${shipping.exact_address}, ${shipping.district}, ${shipping.canton}, ${shipping.province}`,
        shipping_recipient_name: shipping.recipient_name,
        shipping_province: shipping.province,
        shipping_canton: shipping.canton,
        shipping_district: shipping.district,
        shipping_exact_address: shipping.exact_address,
        shipping_phone: shipping.phone,
        shipping_country: 'CR',
      })
      .select('id, subtotal_colones, shipping_cost_colones, total_colones')
      .single();

    if (insertError || !inserted) {
      console.error('order insert error', insertError);
      return json({ error: 'Could not create order' }, 500);
    }

    // Save shipping data to the user's profile for future checkouts
    await admin
      .from('profiles')
      .update({
        full_name: shipping.recipient_name,
        phone: shipping.phone,
        address: `${shipping.exact_address}, ${shipping.district}, ${shipping.canton}, ${shipping.province}`,
        shipping_province: shipping.province,
        shipping_canton: shipping.canton,
        shipping_district: shipping.district,
        shipping_exact_address: shipping.exact_address,
        shipping_phone: shipping.phone,
      })
      .eq('user_id', userId);

    return json({
      order_id: inserted.id,
      subtotal_colones: Number(inserted.subtotal_colones),
      shipping_cost_colones: Number(inserted.shipping_cost_colones),
      total_colones: Number(inserted.total_colones),
    });
  } catch (err) {
    console.error('create-order error', err);
    return json({ error: 'Internal error' }, 500);
  }
});
