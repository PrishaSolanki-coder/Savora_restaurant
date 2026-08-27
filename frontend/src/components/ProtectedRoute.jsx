import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any route element with this to require login (and optionally admin).
// Usage: <ProtectedRoute><Profile /></ProtectedRoute>
//        <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="spinner" role="status" aria-label="Loading" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
