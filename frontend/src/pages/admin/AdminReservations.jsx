import { useEffect, useState, useCallback } from 'react';
import api, { extractMessage } from '../../services/api';
import Alert from '../../components/Alert';

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (date) params.date = date;
      const res = await api.get('/admin/reservations', { params });
      setReservations(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [status, date]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id, newStatus) {
    try {
      await api.put(`/admin/reservations/${id}/status`, { status: newStatus });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem' }}>Reservation Management</h1>
      {message && <Alert type={message.type}>{message.text}</Alert>}

      <div className="menu-toolbar">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrap card">
        {loading ? <div className="spinner" /> : reservations.length === 0 ? (
          <div className="empty-state"><h3>No reservations found</h3></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Contact</th><th>Date</th><th>Time</th><th>Guests</th><th>Status</th></tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}<br /><span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{r.phone}</span></td>
                  <td>{r.reservation_date}</td>
                  <td>{r.reservation_time}</td>
                  <td>{r.guests}</td>
                  <td>
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
