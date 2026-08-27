import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { extractMessage } from '../services/api';
import Alert from '../components/Alert';
import { Link } from 'react-router-dom';

export default function Reservations() {
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    date: '', time: '', guests: 2, message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      await api.post('/reservations', form);
      setResult({ type: 'success', text: 'Your reservation request has been submitted. We will confirm shortly.' });
      setForm((f) => ({ ...f, date: '', time: '', message: '' }));
    } catch (err) {
      setResult({ type: 'error', text: extractMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container section empty-state">
        <h3>Log in to reserve a table</h3>
        <p>We ask for an account so you can view and manage your reservation history.</p>
        <Link to="/login" state={{ from: { pathname: '/reservations' } }} className="btn btn-primary btn-sm">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: 640 }}>
      <div className="section-head" style={{ textAlign: 'left', margin: 0 }}>
        <p className="hero-eyebrow">Book a table</p>
        <h1 style={{ fontSize: '2rem' }}>Reserve Your Table</h1>
      </div>

      {result && <Alert type={result.type}>{result.text}</Alert>}

      <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-5)' }} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" type="tel" required value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" required min={today} value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="time">Time</label>
            <input id="time" type="time" required value={form.time} onChange={(e) => set('time', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="guests">Number of guests</label>
          <input id="guests" type="number" min={1} max={20} required value={form.guests} onChange={(e) => set('guests', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="message">Special request (optional)</label>
          <textarea id="message" rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Request Reservation'}
        </button>
      </form>
    </div>
  );
}
