import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'About' },
    { to: '/reservations', label: 'Reservations' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="site">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand">Savora</Link>

          <button
            className="nav-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}

            <Link to="/cart" className="nav-cart" onClick={() => setMenuOpen(false)}>
              Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="nav-account">
                <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                  {user?.name?.split(' ')[0] || 'Account'}
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h4 className="footer-brand">Savora</h4>
            <p>Seasonal, ingredient-led cooking in a warm, unhurried room.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul className="footer-links">
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/reservations">Reservations</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Visit</h4>
            <p>221B Garden Lane<br />Artist Village, Maharashtra</p>
            <p>Open daily, 11:00 AM – 11:00 PM</p>
          </div>
          <div>
            <h4>Follow</h4>
            <ul className="footer-links">
              <li><a href="#" aria-label="Savora on Instagram">Instagram</a></li>
              <li><a href="#" aria-label="Savora on Facebook">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="container">
          <p className="footer-bottom">© {new Date().getFullYear()} Savora Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
