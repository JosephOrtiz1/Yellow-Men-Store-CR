import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { CRC_PER_USD, getUserId, json } from '../_shared/paypal.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    if (!await getUserId(req)) return json({ error: 'Unauthorized' }, 401);
    // The client ID is PayPal's public SDK identifier; never return the client secret.
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    if (!clientId || !Deno.env.get('PAYPAL_CLIENT_SECRET')) return json({ error: 'PayPal not configured' }, 503);
    return json({ client_id: clientId, sandbox: (Deno.env.get('PAYPAL_ENV') ?? 'sandbox') !== 'live', crc_per_usd: CRC_PER_USD });
  } catch {
    return json({ error: 'Could not load payment configuration' }, 500);
  }
});