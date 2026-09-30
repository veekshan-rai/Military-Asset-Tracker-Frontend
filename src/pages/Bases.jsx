// src/pages/Bases.jsx
import React, { useState, useEffect } from 'react';
import { getBasesApi, createBaseApi } from '../services/api';
import { getUser } from '../utils/auth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { PlusCircle, AlertCircle } from 'lucide-react';

export default function Bases() {
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = getUser() || {};
  const isAdmin = currentUser.role === 'ADMIN';

  const fetchBases = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getBasesApi();
      setBases(response.data || []);
    } catch (err) {
      console.error('Error fetching bases:', err);
      setError('Failed to fetch military bases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBases();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location) {
      setError('Please fill in both Base Name and Location.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: name.trim(),
        location: location.trim(),
      };

      await createBaseApi(payload);

      setSuccess(`Base '${name}' registered successfully!`);
      setName('');
      setLocation('');
      setShowForm(false);

      fetchBases();
    } catch (err) {
      console.error('Error creating base:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to register military base.');
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
            <strong>Access Denied:</strong> Base management is restricted to Administrators.
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
          <h2 className="page-title">Bases</h2>
          <p className="page-subtitle">Configure military installations and base locations.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'Cancel' : 'Add Base'}</span>
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Create Base Form */}
      {showForm && (
        <div className="card">
          <h3 className="card-title">
            <span>New Military Base</span>
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Base Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bangalore Base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Sector *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Karnataka"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
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
                {submitting ? 'Saving...' : 'Save Base'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bases Directory Table */}
      {loading ? (
        <Loading message="Fetching bases..." />
      ) : bases.length === 0 ? (
        <div className="empty-state">No military bases found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Base ID</th>
                <th>Base Name</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {bases.map((base) => (
                <tr key={base.id}>
                  <td>#{base.id}</td>
                  <td>
                    <strong>{base.name}</strong>
                  </td>
                  <td>{base.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
