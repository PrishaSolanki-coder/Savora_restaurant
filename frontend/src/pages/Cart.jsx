import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + tax + (items.length > 0 ? DELIVERY_FEE : 0);

  if (loading) return <div className="spinner" role="status" aria-label="Loading cart" />;

  if (items.length === 0) {
    return (
      <div className="container section empty-state">
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/menu" className="btn btn-primary btn-sm">Browse the Menu</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2rem' }}>Your Cart</h1>

      <div className="cart-layout">
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          {items.map((line) => (
            <div className="cart-line" key={line.id}>
              <img src={line.image || '/images/placeholder-food.jpg'} alt={line.name} />
              <div>
                <h4 style={{ margin: 0 }}>{line.name}</h4>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>₹{Number(line.price).toFixed(0)} each</p>
                {!line.is_available && (
                  <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.82rem' }}>No longer available — please remove</p>
                )}
              </div>
              <div className="qty-control">
                <button onClick={() => updateQuantity(line.id, Math.max(1, line.quantity - 1))} aria-label={`Decrease ${line.name} quantity`}>−</button>
                <span>{line.quantity}</span>
                <button onClick={() => updateQuantity(line.id, line.quantity + 1)} aria-label={`Increase ${line.name} quantity`}>+</button>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(line.id)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery Fee</span><span>₹{DELIVERY_FEE.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>

          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => navigate(isAuthenticated ? '/checkout' : '/login', { state: { from: { pathname: '/checkout' } } })}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
