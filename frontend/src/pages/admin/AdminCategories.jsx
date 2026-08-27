import { useEffect, useState } from 'react';
import api, { extractMessage } from '../../services/api';
import Alert from '../../components/Alert';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await api.get('/categories');
    setCategories(res.data.data);
    setLoading(false);
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: '', description: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post('/categories', form);
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
    if (!confirm('Delete this category? This only works if no menu items use it.')) return;
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem' }}>Category Management</h1>
      {message && <Alert type={message.type}>{message.text}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-6)' }} className="admin-split">
        <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-5)', alignSelf: 'start' }}>
          <h3>{editingId ? 'Edit Category' : 'Add Category'}</h3>
          <div className="field">
            <label htmlFor="cat-name">Name</label>
            <input id="cat-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="cat-desc">Description</label>
            <textarea id="cat-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Update' : 'Add'}
            </button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        <div className="table-wrap card">
          {loading ? <div className="spinner" /> : (
            <table className="data-table">
              <thead><tr><th>Name</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.description}</td>
                    <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
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
