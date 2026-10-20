import { useCallback, useEffect, useRef, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { isConfirmedCapture } from '@/lib/paypalCheckout';

type Props = {
  method: 'card' | 'paypal';
  total: number;
  ensureOrder: () => Promise<string>;
  onPaid: () => void;
};
type Config = { client_id: string; sandbox: boolean; crc_per_usd: number };
const paypalButtonStyle = { layout: 'vertical', label: 'pay', shape: 'rect', height: 48 } as const;

function PaymentFields({ method, total, ensureOrder, onPaid, config }: Props & { config: Config }) {
  const [{ isPending, isRejected, isResolved }] = usePayPalScriptReducer();
  const [error, setError] = useState('');
  const callbacks = useRef({ ensureOrder, onPaid });
  callbacks.current = { ensureOrder, onPaid };
  const createOrder = useCallback(async () => {
    setError('');
    const orderId = await callbacks.current.ensureOrder();
    const { data, error: failure } = await supabase.functions.invoke('paypal-create-order', { body: { order_id: orderId, return_origin: window.location.origin } });
    if (failure || !data?.paypal_order_id) throw new Error('No se pudo preparar el pago. Tu pedido permanece pendiente.');
    return data.paypal_order_id as string;
  }, []);
  const onApprove = useCallback(async ({ orderID }: { orderID: string }) => {
    const orderId = await callbacks.current.ensureOrder();
    const { data, error: failure } = await supabase.functions.invoke('paypal-capture-order', { body: { paypal_order_id: orderID } });
    if (failure || !isConfirmedCapture(data, orderId)) {
      setError('El pago aún no está confirmado. Revisa Mis pedidos antes de volver a pagar.');
      throw new Error('Payment not confirmed');
    }
    callbacks.current.onPaid();
  }, []);
  const onError = useCallback(() => setError('No se completó el pago. Tu pedido no se marca como pagado; puedes reintentarlo.'), []);
  const onCancel = useCallback(() => setError('Cancelaste el pago. No se confirmó ningún cobro; puedes reintentarlo.'), []);
  return <section aria-label={method === 'card' ? 'Datos de tarjeta' : 'Pago con cuenta PayPal'} className="space-y-4">
    <h3 className="font-heading text-2xl flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />{method === 'card' ? 'VISA / MASTERCARD' : 'CUENTA PAYPAL'}</h3>
    <p className="text-sm text-muted-foreground">{config.sandbox ? 'Modo de pruebas: no se realizan cobros reales. ' : ''}Importe en PayPal: <strong className="text-foreground">USD {(total / config.crc_per_usd).toFixed(2)}</strong>.</p>
    {isPending && <p role="status" className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Cargando pago seguro…</p>}
    {isRejected && <p role="alert" className="text-destructive">No se pudo conectar con PayPal. Recarga la página o selecciona SINPE.</p>}
    {isResolved && method === 'card' && <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Pulsa el botón y escribe los datos de tu Visa o Mastercard en la ventana segura de PayPal. No necesitas cuenta de PayPal; Yellow Men Store no recibe ni guarda los datos de tu tarjeta.</p>
      <PayPalButtons fundingSource="card" createOrder={createOrder} onApprove={onApprove} onError={onError} onCancel={onCancel} style={{ layout: 'vertical', shape: 'rect', height: 48 }} />
    </div>}
    {isResolved && method === 'paypal' && <PayPalButtons fundingSource="paypal" createOrder={createOrder} onApprove={onApprove} onError={onError} onCancel={onCancel} style={paypalButtonStyle} />}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}

export function PayPalPayment(props: Props) {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    supabase.functions.invoke('paypal-checkout-config', { body: {} }).then(({ data, error: failure }) => {
      if (!active) return;
      if (failure || !data?.client_id) setError(true);
      else setConfig(data);
    });
    return () => { active = false; };
  }, [attempt]);
  if (error) return <div role="alert" className="space-y-3"><p>No se pudo cargar PayPal.</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Reintentar</Button></div>;
  if (!config) return <p role="status" className="flex gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Cargando pago seguro…</p>;
  return <PayPalScriptProvider options={{ clientId: config.client_id, components: 'buttons', currency: 'USD', intent: 'capture', locale: 'es_ES' }}><PaymentFields {...props} config={config} /></PayPalScriptProvider>;
}