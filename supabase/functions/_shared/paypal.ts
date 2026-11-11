import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

export { CRC_PER_USD } from './paymentRules.ts';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/paypal';

export class ProviderError extends Error {
  constructor(public status: number, public details: string) { super('PayPal request failed'); }
}

export async function paypal(path: string, init: RequestInit = {}) {
  const key = Deno.env.get('LOVABLE_API_KEY');
  const connection = Deno.env.get('PAYPAL_API_KEY');
  if (!key || !connection) throw new ProviderError(503, 'PayPal not configured');
  const response = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, 'X-Connection-Api-Key': connection,
      'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const details = await response.text();
    // Do not log provider responses: they may contain private payer information.
    throw new ProviderError(response.status, details);
  }
  return response.json();
}

export function paymentError(error: unknown) {
  if (error instanceof ProviderError) return json({ error: 'Provider request failed', status: error.status, details: error.details }, error.status);
  return json({ error: 'Internal error' }, 500);
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export async function getUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getClaims(authHeader.replace('Bearer ', ''));
  if (error || !data?.claims) return null;
  return data.claims.sub as string;
}

export function adminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}
