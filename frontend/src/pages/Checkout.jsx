import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { extractMessage } from '../services/api';
import Alert from '../components/Alert';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + tax + DELIVERY_FEE;

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (submitting) return; // prevent duplicate order submissions
    if (!agreed) {
      setError('Please confirm your order details before placing the order.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // NOTE: we do not send prices/totals here — the backend recalculates
      // everything itself from the database, which is the only source of
      // truth for pricing.
      const res = await api.post('/orders', { address, phone, paymentMethod });
      await clearCart();
      navigate(`/orders/${res.data.data.id}`, { replace: true });
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2rem' }}>Checkout</h1>

      <div className="cart-layout">
        <form className="card" style={{ padding: 'var(--space-5)' }} onSubmit={handlePlaceOrder} noValidate>
          {error && <Alert type="error">{error}</Alert>}

          <h3>Delivery Details</h3>
          <div className="field">
            <label htmlFor="address">Delivery address</label>
            <textarea id="address" rows={3} required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <h3 style={{ marginTop: 'var(--space-5)' }}>Payment Method</h3>
          <div className="field">
            <label>
              <input type="radio" name="pm" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ width: 'auto', marginRight: 8 }} />
              Cash on Delivery
            </label>
          </div>
          <div className="field">
            <label>
              <input type="radio" name="pm" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} style={{ width: 'auto', marginRight: 8 }} />
              UPI (placeholder — no live payment gateway connected yet)
            </label>
          </div>
          <div className="field">
            <label>
              <input type="radio" name="pm" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} style={{ width: 'auto', marginRight: 8 }} />
              Card (placeholder — no live payment gateway connected yet)
            </label>
          </div>
          {paymentMethod !== 'COD' && (
            <Alert type="info">
              This is a simulated payment option for demo purposes. No real payment is processed —
              your order will be recorded with payment status "Pending" just like Cash on Delivery,
              until a real payment gateway (e.g. Razorpay/Stripe) is integrated.
            </Alert>
          )}

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <label>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 'auto', marginRight: 8 }} />
              I've reviewed my order and delivery details.
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place Order — ₹${total.toFixed(2)}`}
          </button>
        </form>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3>Order Summary</h3>
          {items.map((line) => (
            <div className="summary-row" key={line.id}>
              <span>{line.name} × {line.quantity}</span>
              <span>₹{(line.price * line.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery Fee</span><span>₹{DELIVERY_FEE.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
