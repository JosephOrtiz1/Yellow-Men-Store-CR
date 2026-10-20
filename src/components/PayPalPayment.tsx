import { useCallback, useEffect, useRef, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, PayPalCardFieldsProvider, PayPalNameField, PayPalNumberField, PayPalExpiryField, PayPalCVVField, usePayPalCardFields, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { CreditCard, Loader2, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { isConfirmedCapture, paymentExperience } from '@/lib/paypalCheckout';

type Props = {
  method: 'card' | 'paypal';
  total: number;
  ensureOrder: () => Promise<string>;
  onPaid: () => void;
};
type Config = { client_id: string; sandbox: boolean; crc_per_usd: number };

function SubmitCard() {
  const { cardFieldsForm } = usePayPalCardFields();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  return <div className="space-y-3">
    <Button size="lg" className="w-full" disabled={!cardFieldsForm || submitting} onClick={async () => {
      if (!cardFieldsForm || submitting) return;
      setError('');
      setSubmitting(true);
      try {
        const state = await cardFieldsForm.getState();
        if (!state.isFormValid) { setError('Revisa el número de tarjeta, vencimiento y código de seguridad.'); return; }
        await cardFieldsForm.submit();
      } catch { setError('No se completó el pago. Revisa tus datos o utiliza otro método.'); }
      finally { setSubmitting(false); }
    }}>{submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LockKeyhole className="w-4 h-4 mr-2" />}Pagar con tarjeta</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}

function PaymentFields({ method, total, ensureOrder, onPaid, config }: Props & { config: Config }) {
  const [{ isPending, isRejected, isResolved }] = usePayPalScriptReducer();
  const [error, setError] = useState('');
  const [eligible, setEligible] = useState<boolean | null>(null);
  const callbacks = useRef({ ensureOrder, onPaid });
  callbacks.current = { ensureOrder, onPaid };
  useEffect(() => {
    if (!isResolved) return;
    setEligible(window.paypal?.CardFields?.().isEligible() ?? false);
  }, [isResolved]);
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
  const css = getComputedStyle(document.documentElement);
  const fieldStyle = { input: { color: `hsl(${css.getPropertyValue('--foreground').trim()})`, background: `hsl(${css.getPropertyValue('--background').trim()})`, fontSize: '16px', fontFamily: 'Arial, sans-serif', padding: '12px' } };
  return <section aria-label={method === 'card' ? 'Datos de tarjeta' : 'Pago con cuenta PayPal'} className="space-y-4">
    <h3 className="font-heading text-2xl flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />{method === 'card' ? 'VISA / MASTERCARD' : 'CUENTA PAYPAL'}</h3>
    <p className="text-sm text-muted-foreground">{config.sandbox ? 'Modo de pruebas: no se realizan cobros reales. ' : ''}Importe en PayPal: <strong className="text-foreground">USD {(total / config.crc_per_usd).toFixed(2)}</strong>.</p>
    {isPending && <p role="status" className="flex gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Cargando pago seguro…</p>}
    {isRejected && <p role="alert" className="text-destructive">No se pudo conectar con PayPal. Recarga la página o selecciona SINPE.</p>}
    {isResolved && paymentExperience(method) === 'card-fields' && eligible === false && <p role="alert" className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">PayPal no habilita los campos de tarjeta para esta cuenta de comercio. Selecciona cuenta PayPal o SINPE para continuar.</p>}
    {isResolved && method === 'card' && eligible && <PayPalCardFieldsProvider createOrder={createOrder} onApprove={onApprove} onError={onError} style={fieldStyle}>
      <div className="space-y-4">
        <div><p className="text-sm mb-2">Nombre del titular</p><PayPalNameField className="h-12 border border-border rounded" placeholder="Nombre como aparece en la tarjeta" /></div>
        <div><p className="text-sm mb-2">Número de tarjeta</p><PayPalNumberField className="h-12 border border-border rounded" placeholder="Número de tarjeta" /></div>
        <div className="grid grid-cols-2 gap-4"><div><p className="text-sm mb-2">Vencimiento</p><PayPalExpiryField className="h-12 border border-border rounded" placeholder="MM/AA" /></div><div><p className="text-sm mb-2">Código de seguridad</p><PayPalCVVField className="h-12 border border-border rounded" placeholder="CVV" /></div></div>
        <p className="text-xs text-muted-foreground">PayPal protege los datos de tu tarjeta. Yellow Men Store no los recibe ni los guarda.</p>
        <SubmitCard />
      </div>
    </PayPalCardFieldsProvider>}
    {isResolved && method === 'paypal' && <PayPalButtons fundingSource="paypal" createOrder={createOrder} onApprove={onApprove} onError={onError} onCancel={() => setError('Cancelaste el pago. No se confirmó ningún cobro; puedes reintentarlo.')} style={{ layout: 'vertical', label: 'pay', shape: 'rect', height: 48 }} />}
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
  return <PayPalScriptProvider options={{ clientId: config.client_id, components: 'buttons,card-fields', currency: 'USD', intent: 'capture', locale: 'es_ES' }}><PaymentFields {...props} config={config} /></PayPalScriptProvider>;
}