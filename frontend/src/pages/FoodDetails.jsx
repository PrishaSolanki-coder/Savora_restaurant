import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import FoodCard from '../components/FoodCard';
import Alert from '../components/Alert';

export default function FoodDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState(null);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    api
      .get(`/menu/${id}`)
      .then((res) => {
        setItem(res.data.data.item);
        setRelated(res.data.data.related);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    setAdding(true);
    const res = await addToCart(item.id, quantity);
    setMessage(res.success ? { type: 'success', text: `Added ${quantity} × ${item.name} to cart.` } : { type: 'error', text: res.message });
    setAdding(false);
  }

  if (loading) return <div className="spinner" role="status" aria-label="Loading dish" />;

  if (notFound || !item) {
    return (
      <div className="container section empty-state">
        <h3>We couldn't find that dish</h3>
        <p>It may have been removed from the menu.</p>
        <Link to="/menu" className="btn btn-outline btn-sm">Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)', alignItems: 'start' }} className="food-details-grid">
        <img
          src={item.image || '/images/placeholder-food.jpg'}
          alt={item.name}
          style={{ borderRadius: 'var(--radius-lg)', width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
        />

        <div>
          <p className="hero-eyebrow">{item.category_name}</p>
          <h1 style={{ fontSize: '2rem' }}>{item.name}</h1>

          <div className="food-card-badges" style={{ marginBottom: 'var(--space-4)' }}>
            <span className={`badge ${item.is_vegetarian ? 'badge-veg' : 'badge-nonveg'}`}>
              {item.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
            </span>
            {!!item.is_featured && <span className="badge badge-featured">Popular</span>}
            <span className="badge badge-status">{item.is_available ? 'Available' : 'Currently Unavailable'}</span>
          </div>

          <p style={{ fontSize: '1.05rem' }}>{item.description}</p>
          {item.ingredients && (
            <p><strong style={{ color: 'var(--forest-dark)' }}>Ingredients:</strong> {item.ingredients}</p>
          )}

          <p className="food-card-price" style={{ fontSize: '1.6rem' }}>₹{Number(item.price).toFixed(0)}</p>

          {message && <Alert type={message.type}>{message.text}</Alert>}

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-4)' }}>
            <div className="qty-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span aria-live="polite" style={{ minWidth: 24, textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn btn-primary" disabled={!item.is_available || adding} onClick={handleAdd}>
              {adding ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="divider">🌿</div>
          <h2 style={{ marginBottom: 'var(--space-5)' }}>You might also like</h2>
          <div className="food-grid">
            {related.map((r) => <FoodCard key={r.id} item={r} onAdd={() => {}} />)}
          </div>
        </section>
      )}
    </div>
  );
}
