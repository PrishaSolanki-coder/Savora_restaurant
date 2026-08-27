import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { extractMessage } from '../services/api';
import Alert from '../components/Alert';

const STEPS = [
  { key: 'PENDING', label: 'Order Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadOrder() {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      await loadOrder();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <div className="spinner" role="status" aria-label="Loading order" />;
  if (error || !order) {
    return (
      <div className="container section">
        <Alert type="error">{error || 'Order not found.'}</Alert>
        <Link to="/profile" className="btn btn-outline btn-sm">Back to Profile</Link>
      </div>
    );
  }

  const isCancelled = order.order_status === 'CANCELLED';
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.order_status);

  return (
    <div className="container section">
      <h1 style={{ fontSize: '1.8rem' }}>Order #{order.id}</h1>
      <p>Placed on {new Date(order.created_at).toLocaleString()}</p>

      {isCancelled ? (
        <Alert type="error">This order was cancelled.</Alert>
      ) : (
        <div className="tracker" role="list" aria-label="Order progress">
          {STEPS.map((step, idx) => (
            <div
              key={step.key}
              role="listitem"
              className={`tracker-step ${idx < currentStepIndex ? 'is-done' : ''} ${idx === currentStepIndex ? 'is-current' : ''}`}
            >
              <div className="tracker-dot">{idx < currentStepIndex ? '✓' : idx + 1}</div>
              <span className="tracker-label">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
        <h3>Items</h3>
        {order.items.map((item) => (
          <div className="summary-row" key={item.id}>
            <span>{item.name || 'Item removed from menu'} × {item.quantity}</span>
            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-row"><span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(2)}</span></div>
        <div className="summary-row"><span>Tax</span><span>₹{Number(order.tax).toFixed(2)}</span></div>
        <div className="summary-row"><span>Delivery Fee</span><span>₹{Number(order.delivery_fee).toFixed(2)}</span></div>
        <div className="summary-row total"><span>Total</span><span>₹{Number(order.total_amount).toFixed(2)}</span></div>
      </div>

      <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
        <h3>Delivery & Payment</h3>
        <p><strong>Address:</strong> {order.address}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Payment Method:</strong> {order.payment_method}</p>
        <p><strong>Payment Status:</strong> {order.payment_status}</p>
      </div>

      {['PENDING', 'CONFIRMED'].includes(order.order_status) && (
        <button className="btn btn-danger btn-sm" style={{ marginTop: 'var(--space-5)' }} onClick={handleCancel} disabled={cancelling}>
          {cancelling ? 'Cancelling…' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
