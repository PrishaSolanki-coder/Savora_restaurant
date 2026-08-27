import { useEffect, useState } from 'react';
import api, { extractMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

// Note: the spec's "contact form" (general inquiries) and "reviews" both
// live on this page since they're both about hearing from guests. Reviews
// are tied to a logged-in account (so they're attributable); the contact
// form is open to anyone.
export default function Contact() {
  const { isAuthenticated } = useAuth();

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactResult, setContactResult] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    api.get('/reviews').then((res) => setReviews(res.data.data)).catch(() => {});
  }, []);

  async function handleContactSubmit(e) {
    e.preventDefault();
    if (contactSubmitting) return;
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactResult({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    setContactSubmitting(true);
    // NOTE: there's no dedicated "contact messages" table in this build's
    // schema, so this demonstrates the client-side validation + UX flow.
    // Wiring it to a real backend endpoint/table (or an email service) is
    // a small, isolated addition — see README "Extending the project".
    setTimeout(() => {
      setContactResult({ type: 'success', text: 'Thanks for reaching out — we will get back to you soon.' });
      setContactForm({ name: '', email: '', message: '' });
      setContactSubmitting(false);
    }, 400);
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (reviewSubmitting) return;
    setReviewSubmitting(true);
    setReviewResult(null);
    try {
      const res = await api.post('/reviews', reviewForm);
      setReviews((prev) => [res.data.data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      setReviewResult({ type: 'success', text: 'Thank you for your review!' });
    } catch (err) {
      setReviewResult({ type: 'error', text: extractMessage(err) });
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div className="container section">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-7)' }} className="contact-grid">
        <div>
          <p className="hero-eyebrow">Get in touch</p>
          <h1 style={{ fontSize: '2rem' }}>Contact Us</h1>
          <p><strong>Address:</strong> 221B Garden Lane, Artist Village, Maharashtra</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
          <p><strong>Email:</strong> hello@savora.example</p>
          <p><strong>Hours:</strong> Daily, 11:00 AM – 11:00 PM</p>

          <div className="card" style={{ height: 220, marginTop: 'var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)' }}>
            Map placeholder — embed Google Maps here with your restaurant's address
          </div>
        </div>

        <div>
          <h3>Send a message</h3>
          {contactResult && <Alert type={contactResult.type}>{contactResult.text}</Alert>}
          <form onSubmit={handleContactSubmit} className="card" style={{ padding: 'var(--space-5)' }} noValidate>
            <div className="field">
              <label htmlFor="cname">Name</label>
              <input id="cname" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="cemail">Email</label>
              <input id="cemail" type="email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="cmessage">Message</label>
              <textarea id="cmessage" rows={4} required value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={contactSubmitting}>
              {contactSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      <div className="divider">🌿</div>

      <div className="section-head">
        <p className="hero-eyebrow">Guest Reviews</p>
        <h2>What people are saying</h2>
      </div>

      {isAuthenticated && (
        <form onSubmit={handleReviewSubmit} className="card" style={{ padding: 'var(--space-5)', maxWidth: 520, margin: '0 auto var(--space-6)' }} noValidate>
          {reviewResult && <Alert type={reviewResult.type}>{reviewResult.text}</Alert>}
          <div className="field">
            <label htmlFor="rating">Rating</label>
            <select id="rating" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="comment">Your review</label>
            <textarea id="comment" rows={3} required minLength={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-accent btn-block" disabled={reviewSubmitting}>
            {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="empty-state"><h3>No reviews yet</h3><p>Be the first to share your experience.</p></div>
      ) : (
        <div className="testimonial-grid">
          {reviews.map((r) => (
            <div key={r.id} className="card testimonial-card">
              <div className="stars" aria-label={`${r.rating} out of 5 stars`}>
                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
              </div>
              <p style={{ marginBottom: 'var(--space-2)' }}>"{r.comment}"</p>
              <p style={{ fontWeight: 600, color: 'var(--forest-dark)', margin: 0 }}>{r.user_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
