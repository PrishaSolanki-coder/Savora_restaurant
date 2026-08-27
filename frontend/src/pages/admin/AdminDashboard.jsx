import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" role="status" aria-label="Loading dashboard" />;

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders },
    { label: "Today's Orders", value: stats.todaysOrders },
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toFixed(0)}` },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Customers', value: stats.totalUsers },
    { label: 'Reservations', value: stats.totalReservations },
    { label: 'Menu Items', value: stats.totalMenuItems },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem' }}>Dashboard Overview</h1>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="card stat-card">
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
