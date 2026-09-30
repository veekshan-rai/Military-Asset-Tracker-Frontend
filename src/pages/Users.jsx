// src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, getBasesApi } from '../services/api';
import { getUser } from '../utils/auth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { PlusCircle, AlertCircle } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('LOGISTICS_OFFICER');
  const [assignedBaseId, setAssignedBaseId] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = getUser() || {};
  const isAdmin = currentUser.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [usersRes, basesRes] = await Promise.all([
          getUsersApi(),
          getBasesApi(),
        ]);
        setUsers(usersRes.data || []);
        setBases(basesRes.data || []);
      } catch (err) {
        console.error('Error fetching users/bases:', err);
        setError('Failed to fetch user directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const fetchUsersList = async () => {
    try {
      const res = await getUsersApi();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error refreshing users list:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (role !== 'ADMIN' && !assignedBaseId) {
      setError('Assigned base is required for this role.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password: password,
        role: role,
        assignedBase: assignedBaseId ? { id: parseInt(assignedBaseId) } : null,
      };

      await createUserApi(payload);

      setSuccess(`User account '${username}' created successfully!`);
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('LOGISTICS_OFFICER');
      setAssignedBaseId('');
      setShowForm(false);

      fetchUsersList();
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create user account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>
            <strong>Access Denied:</strong> User management is restricted to Administrators.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Standard Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">Manage system user accounts, roles, and base assignments.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'Cancel' : 'Create User'}</span>
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Create User Form */}
      {showForm && (
        <div className="card">
          <h3 className="card-title">
            <span>New System User</span>
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="User email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (error) setError('');
                  }}
                  required
                >
                  <option value="LOGISTICS_OFFICER">LOGISTICS_OFFICER</option>
                  <option value="BASE_COMMANDER">BASE_COMMANDER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Assigned Base{role !== 'ADMIN' ? ' *' : ''}
                </label>
                <select
                  className="form-select"
                  value={assignedBaseId}
                  onChange={(e) => {
                    setAssignedBaseId(e.target.value);
                    if (error) setError('');
                  }}
                  required={role !== 'ADMIN'}
                >
                  <option value="">No Base Assigned</option>
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List Table (Password NEVER displayed!) */}
      {loading ? (
        <Loading message="Fetching users..." />
      ) : users.length === 0 ? (
        <div className="empty-state">No user accounts found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Base</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <strong>{u.username}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === 'ADMIN'
                          ? 'badge-purple'
                          : u.role === 'BASE_COMMANDER'
                          ? 'badge-blue'
                          : 'badge-amber'
                      }`}
                    >
                      {u.role ? u.role.replace('_', ' ') : 'N/A'}
                    </span>
                  </td>
                  <td>{u.assignedBase?.name ? `${u.assignedBase.name}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
