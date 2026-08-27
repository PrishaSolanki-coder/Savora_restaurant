import { useEffect, useState } from 'react';
import api, { extractMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await api.get('/admin/users');
    setUsers(res.data.data);
    setLoading(false);
  }

  async function changeRole(id, role) {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user account? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: extractMessage(err) });
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem' }}>User Management</h1>
      {message && <Alert type={message.type}>{message.text}</Alert>}

      <div className="table-wrap card">
        {loading ? <div className="spinner" /> : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={u.id === currentUser.id}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" disabled={u.id === currentUser.id} onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
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
