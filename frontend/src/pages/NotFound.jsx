import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section empty-state">
      <h1 style={{ fontSize: '2.4rem' }}>404</h1>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn btn-primary btn-sm">Back to Home</Link>
    </div>
  );
}
