import { useEffect, useState } from 'react';
import api, { extractMessage } from '../../services/api';
import Alert from '../../components/Alert';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await api.get('/admin/reviews');
    setReviews(res.data.data);
    setLoading(false);
  }

  async function moderate(id, status) {
    try {
      await api.put(`/admin/reviews/${id}/moderate`, { status });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem' }}>Review Moderation</h1>
      {message && <Alert type={message.type}>{message.text}</Alert>}

      <div className="table-wrap card">
        {loading ? <div className="spinner" /> : reviews.length === 0 ? (
          <div className="empty-state"><h3>No reviews yet</h3></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>User</th><th>Rating</th><th>Comment</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.user_name}<br /><span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{r.user_email}</span></td>
                  <td>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                  <td style={{ whiteSpace: 'normal', maxWidth: 320 }}>{r.comment}</td>
                  <td><span className="badge badge-status">{r.status}</span></td>
                  <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {r.status !== 'APPROVED' && <button className="btn btn-outline btn-sm" onClick={() => moderate(r.id, 'APPROVED')}>Approve</button>}
                    {r.status !== 'REJECTED' && <button className="btn btn-ghost btn-sm" onClick={() => moderate(r.id, 'REJECTED')}>Reject</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
