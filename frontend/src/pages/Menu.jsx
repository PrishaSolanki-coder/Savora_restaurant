import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import FoodCard from '../components/FoodCard';
import Alert from '../components/Alert';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [message, setMessage] = useState(null);
  const { addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [veg, setVeg] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (veg) params.veg = veg;
      if (sort) params.sort = sort;
      const res = await api.get('/menu', { params });
      setItems(res.data.data);
    } catch {
      setError('Could not load the menu right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, [search, category, veg, sort]);

  useEffect(() => {
    const t = setTimeout(loadMenu, 300); // debounce search typing
    return () => clearTimeout(t);
  }, [loadMenu]);

  async function handleAdd(item) {
    setAddingId(item.id);
    const res = await addToCart(item.id, 1);
    setMessage(res.success ? { type: 'success', text: `${item.name} added to cart.` } : { type: 'error', text: res.message });
    setAddingId(null);
    setTimeout(() => setMessage(null), 2500);
  }

  return (
    <div className="container section">
      <div className="section-head" style={{ marginBottom: 'var(--space-5)' }}>
        <p className="hero-eyebrow">Full Menu</p>
        <h1 style={{ fontSize: '2.2rem' }}>Everything we're cooking today</h1>
      </div>

      {message && <Alert type={message.type}>{message.text}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="menu-toolbar">
        <input
          type="search"
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search the menu"
        />
        <select value={veg} onChange={(e) => setVeg(e.target.value)} aria-label="Filter by diet">
          <option value="">All diets</option>
          <option value="veg">Vegetarian</option>
          <option value="nonveg">Non-Vegetarian</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort menu">
          <option value="">Sort: Newest</option>
          <option value="popular">Sort: Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <div className="chip-row" style={{ marginBottom: 'var(--space-6)' }}>
        <button className={`chip ${category === '' ? 'is-active' : ''}`} onClick={() => setCategory('')}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${category === c.name ? 'is-active' : ''}`}
            onClick={() => setCategory(c.name)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" role="status" aria-label="Loading menu" />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>No dishes match your filters</h3>
          <p>Try clearing the search or choosing a different category.</p>
        </div>
      ) : (
        <div className="food-grid">
          {items.map((item) => (
            <FoodCard key={item.id} item={item} onAdd={handleAdd} adding={addingId === item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
