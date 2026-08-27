import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import FoodCard from '../components/FoodCard';
import Alert from '../components/Alert';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [message, setMessage] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const [menuRes, reviewsRes] = await Promise.all([
          api.get('/menu', { params: { sort: 'popular' } }),
          api.get('/reviews'),
        ]);
        setFeatured(menuRes.data.data.filter((i) => i.is_featured).slice(0, 6));
        setReviews(reviewsRes.data.data.slice(0, 3));
      } catch {
        // Home page still renders fine without these — sections just show empty states.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAdd(item) {
    setAddingId(item.id);
    const res = await addToCart(item.id, 1);
    setMessage(res.success ? { type: 'success', text: `${item.name} added to cart.` } : { type: 'error', text: res.message });
    setAddingId(null);
    setTimeout(() => setMessage(null), 2500);
  }

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <p className="hero-eyebrow">Est. in a garden lane, since always evolving</p>
          <h1>Slow food, cooked with intention.</h1>
          <p style={{ fontSize: '1.05rem' }}>
            Savora is a neighbourhood restaurant built around what's in season — grilled,
            simmered, and plated by people who care where the ingredients came from.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-primary">View Menu</Link>
            <Link to="/reservations" className="btn btn-outline">Reserve a Table</Link>
          </div>
        </div>
      </section>

      {message && (
        <div className="container" style={{ marginTop: 'var(--space-4)' }}>
          <Alert type={message.type}>{message.text}</Alert>
        </div>
      )}

      {/* Featured dishes */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="hero-eyebrow">From the kitchen</p>
            <h2>Popular this week</h2>
          </div>

          {loading ? (
            <div className="spinner" role="status" aria-label="Loading dishes" />
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <h3>No featured dishes yet</h3>
              <p>Check back soon, or browse the full menu.</p>
              <Link to="/menu" className="btn btn-outline btn-sm">Browse Menu</Link>
            </div>
          ) : (
            <div className="food-grid">
              {featured.map((item) => (
                <FoodCard key={item.id} item={item} onAdd={handleAdd} adding={addingId === item.id} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container"><div className="divider">🌿</div></div>

      {/* About strip */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h2>A room built for lingering</h2>
          <p>
            We built Savora around a single idea: food tastes better when nobody's rushing.
            Our menu changes with the seasons, our tables are spaced for real conversation,
            and our kitchen is visible from the dining room because we're not hiding anything.
          </p>
          <p>Open daily, 11:00 AM – 11:00 PM. Reservations recommended on weekends.</p>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-alt)' }}>
          <div className="container">
            <div className="section-head">
              <p className="hero-eyebrow">What guests say</p>
              <h2>Reviews from our table</h2>
            </div>
            <div className="testimonial-grid">
              {reviews.map((r) => (
                <div key={r.id} className="card testimonial-card">
                  <div className="stars" aria-label={`${r.rating} out of 5 stars`}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                  <p style={{ marginBottom: 'var(--space-2)' }}>"{r.comment}"</p>
                  <p style={{ fontWeight: 600, color: 'var(--forest-dark)', margin: 0 }}>{r.user_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
