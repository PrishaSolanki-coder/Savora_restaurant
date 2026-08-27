import { useEffect, useState, useCallback } from 'react';
import api, { extractMessage } from '../../services/api';
import Alert from '../../components/Alert';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await api.get('/admin/orders', { params });
      setOrders(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function updateStatus(id, newStatus) {
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem' }}>Order Management</h1>
      {message && <Alert type={message.type}>{message.text}</Alert>}

      <div className="menu-toolbar">
        <input type="search" placeholder="Search by customer or order ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="table-wrap card">
        {loading ? <div className="spinner" /> : orders.length === 0 ? (
          <div className="empty-state"><h3>No orders found</h3></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name}<br /><span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{o.customer_email}</span></td>
                  <td>₹{Number(o.total_amount).toFixed(2)}</td>
                  <td>{o.payment_method} · {o.payment_status}</td>
                  <td>
                    <select value={o.order_status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
