import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { logout, user } = useAuth();

  const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/menu', label: 'Menu' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/reservations', label: 'Reservations' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/reviews', label: 'Reviews' },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="brand">Savora</Link>
        <nav aria-label="Admin navigation" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'var(--space-6)', fontSize: '0.85rem' }}>
          <p style={{ color: '#C9C3B2', marginBottom: 'var(--space-2)' }}>{user?.name}</p>
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={logout}>Logout</button>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
