import { useEffect, useState } from 'react';
import api, { extractMessage } from '../../services/api';
import Alert from '../../components/Alert';

const EMPTY_FORM = {
  category_id: '', name: '', description: '', ingredients: '', price: '',
  image: '', is_vegetarian: false, is_available: true, is_featured: false,
};

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [menuRes, catRes] = await Promise.all([api.get('/menu'), api.get('/categories')]);
    setItems(menuRes.data.data);
    setCategories(catRes.data.data);
    setLoading(false);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      category_id: item.category_id, name: item.name, description: item.description || '',
      ingredients: item.ingredients || '', price: item.price, image: item.image || '',
      is_vegetarian: !!item.is_vegetarian, is_available: !!item.is_available, is_featured: !!item.is_featured,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    const payload = { ...form, category_id: Number(form.category_id), price: Number(form.price) };
    try {
      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
      } else {
        await api.post('/menu', payload);
      }
      await load();
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this menu item permanently?')) return;
    try {
      await api.delete(`/menu/${id}`);
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  async function toggleAvailability(item) {
    try {
      await api.put(`/menu/${item.id}`, { ...item, is_available: !item.is_available });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem' }}>Menu Management</h1>
      {message && <Alert type={message.type}>{message.text}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 'var(--space-6)' }} className="admin-split">
        <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-5)', alignSelf: 'start' }}>
          <h3>{editingId ? 'Edit Item' : 'Add Menu Item'}</h3>

          <div className="field">
            <label htmlFor="m-category">Category</label>
            <select id="m-category" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="m-name">Name</label>
            <input id="m-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="m-desc">Description</label>
            <textarea id="m-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="m-ingredients">Ingredients</label>
            <input id="m-ingredients" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="m-price">Price (₹)</label>
            <input id="m-price" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="m-image">Image URL</label>
            <input id="m-image" placeholder="/images/dish.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>

          <div className="field" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={form.is_vegetarian} onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })} />
              Vegetarian
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
              Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Featured
            </label>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Update Item' : 'Add Item'}
            </button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <div className="table-wrap card">
          {loading ? <div className="spinner" /> : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category_name}</td>
                    <td>₹{Number(item.price).toFixed(0)}</td>
                    <td>
                      <button className="badge badge-status" style={{ border: 'none' }} onClick={() => toggleAvailability(item)}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
