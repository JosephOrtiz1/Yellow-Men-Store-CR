import { describe, expect, it } from 'vitest';
import { isConfirmedCapture, paymentExperience } from './paypalCheckout';

describe('checkout payment rules', () => {
  it('uses secure embedded fields for credit or debit cards', () => {
    expect(paymentExperience('card')).toBe('card-fields');
  });
  it('uses the account popup for PayPal accounts', () => {
    expect(paymentExperience('paypal')).toBe('account-popup');
  });
  it('requires a paid server capture for this exact order', () => {
    expect(isConfirmedCapture({ status: 'paid', order_id: 'order-a' }, 'order-a')).toBe(true);
    expect(isConfirmedCapture({ status: 'pending', order_id: 'order-a' }, 'order-a')).toBe(false);
    expect(isConfirmedCapture({ status: 'paid', order_id: 'order-b' }, 'order-a')).toBe(false);
  });
});