import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const res = await register(form);
    setSubmitting(false);
    if (res.success) {
      navigate('/', { replace: true });
    } else {
      setError(res.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 style={{ fontSize: '1.8rem' }}>Create your account</h1>
        <p>Save your details for faster checkout and order tracking.</p>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => set('password', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" required autoComplete="new-password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
