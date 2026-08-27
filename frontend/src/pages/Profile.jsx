import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { extractMessage } from '../services/api';
import Alert from '../components/Alert';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, reservationsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/reservations'),
        ]);
        setOrders(ordersRes.data.data);
        setReservations(reservationsRes.data.data);
      } catch {
        // history sections just show empty state on failure
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, []);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile(form);
    setProfileMsg(res.success ? { type: 'success', text: 'Profile updated.' } : { type: 'error', text: res.message });
    setSavingProfile(false);
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2rem' }}>My Account</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-6)' }} className="profile-grid">
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h3>Profile Information</h3>
          <p style={{ fontSize: '0.85rem' }}>Email: {user?.email}</p>
          {profileMsg && <Alert type={profileMsg.type}>{profileMsg.text}</Alert>}
          <form onSubmit={handleProfileSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 'var(--space-3)' }} onClick={logout}>
            Logout
          </button>
        </div>

        <div>
          <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
            <h3>Order History</h3>
            {loadingHistory ? (
              <div className="spinner" />
            ) : orders.length === 0 ? (
              <p>You haven't placed any orders yet. <Link to="/menu">Browse the menu</Link>.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td>₹{Number(o.total_amount).toFixed(2)}</td>
                        <td><span className="badge badge-status">{o.order_status}</span></td>
                        <td><Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Track</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h3>Reservation History</h3>
            {loadingHistory ? (
              <div className="spinner" />
            ) : reservations.length === 0 ? (
              <p>No reservations yet. <Link to="/reservations">Book a table</Link>.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id}>
                        <td>{r.reservation_date}</td>
                        <td>{r.reservation_time}</td>
                        <td>{r.guests}</td>
                        <td><span className="badge badge-status">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
