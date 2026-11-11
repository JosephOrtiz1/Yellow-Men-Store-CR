import { describe, expect, it } from 'vitest';
import { PAYMENT_ENVIRONMENT, trustedOrigin, verifiedCapture } from '../../supabase/functions/_shared/paymentRules';

describe('production payments', () => {
  it('creates new payments in live mode', () => { expect(PAYMENT_ENVIRONMENT).toBe('live'); });
  it('only accepts store and exact preview return origins', () => {
    expect(trustedOrigin('https://yellowmenstore.lovable.app/path')).toBe('https://yellowmenstore.lovable.app');
    expect(trustedOrigin('https://evil.lovable.app')).toBe('https://yellowmenstore.lovable.app');
    expect(trustedOrigin('https://yellowmenstore.lovable.app.evil.com')).toBe('https://yellowmenstore.lovable.app');
  });
  it('requires matching completed USD capture for the exact order and amount', () => {
    const data = { status: 'COMPLETED', purchase_units: [{ custom_id: 'a', reference_id: 'a', payments: { captures: [{ status: 'COMPLETED', amount: { currency_code: 'USD', value: '10.00' } }] } }] };
    expect(verifiedCapture(data, 'a', 5100)).toBe(true);
    expect(verifiedCapture(data, 'b', 5100)).toBe(false);
    expect(verifiedCapture(data, 'a', 10200)).toBe(false);
    data.purchase_units[0].payments.captures[0].status = 'PENDING';
    expect(verifiedCapture(data, 'a', 5100)).toBe(false);
  });
});