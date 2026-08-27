import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // prevent duplicate submissions
    setSubmitting(true);
    setError(null);
    const res = await login(form);
    setSubmitting(false);
    if (res.success) {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } else {
      setError(res.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 style={{ fontSize: '1.8rem' }}>Welcome back</h1>
        <p>Log in to order, track deliveries, and manage reservations.</p>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" required autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" required autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--forest)', fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
