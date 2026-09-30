// src/pages/Equipment.jsx
import React, { useState, useEffect } from 'react';
import { getEquipmentApi, createEquipmentApi } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { PlusCircle } from 'lucide-react';

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [unit, setUnit] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEquipment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEquipmentApi();
      setEquipmentList(response.data || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setError('Failed to fetch equipment catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !equipmentType || !unit) {
      setError('Please fill in all fields (Name, Type, Unit).');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: name.trim(),
        equipmentType: equipmentType.trim(),
        unit: unit.trim(),
      };

      await createEquipmentApi(payload);

      setSuccess(`Equipment '${name}' added successfully!`);
      setName('');
      setEquipmentType('');
      setUnit('');
      setShowForm(false);

      fetchEquipment();
    } catch (err) {
      console.error('Error registering equipment:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to register equipment type.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Standard Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Equipment</h2>
          <p className="page-subtitle">Manage military equipment catalog and item units.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'Cancel' : 'Add Equipment'}</span>
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Create Equipment Form */}
      {showForm && (
        <div className="card">
          <h3 className="card-title">
            <span>New Equipment Item</span>
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Equipment Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AK-47"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Equipment Type *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Weapon, Fuel, Medical"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. pieces, liters, kits"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
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
                {submitting ? 'Saving...' : 'Save Equipment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Equipment Catalog Table */}
      {loading ? (
        <Loading message="Fetching equipment catalog..." />
      ) : equipmentList.length === 0 ? (
        <div className="empty-state">No equipment items registered.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Equipment Type</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-blue">{item.equipmentType}</span>
                  </td>
                  <td>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
