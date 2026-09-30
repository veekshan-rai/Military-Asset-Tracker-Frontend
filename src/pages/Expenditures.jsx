// src/pages/Expenditures.jsx
import React, { useState, useEffect } from 'react';
import {
  getExpendituresApi,
  createExpenditureApi,
  getEquipmentApi,
  getBasesApi,
} from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { PlusCircle } from 'lucide-react';

export default function Expenditures() {
  const [expenditures, setExpenditures] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [equipmentId, setEquipmentId] = useState('');
  const [baseId, setBaseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expenditureDate, setExpenditureDate] = useState('');
  const [reason, setReason] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [equipRes, basesRes] = await Promise.all([
          getEquipmentApi(),
          getBasesApi(),
        ]);
        setEquipmentList(equipRes.data || []);
        setBases(basesRes.data || []);
      } catch (err) {
        console.error('Failed to load dropdown options:', err);
      }
    };
    fetchDropdownData();
  }, []);

  const fetchExpenditures = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getExpendituresApi();
      setExpenditures(response.data || []);
    } catch (err) {
      console.error('Error fetching expenditures:', err);
      setError('Failed to fetch expenditure history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenditures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipmentId || !baseId || !quantity || !expenditureDate || !reason) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        equipment: { id: parseInt(equipmentId) },
        base: { id: parseInt(baseId) },
        quantity: parseInt(quantity),
        expenditureDate: new Date(expenditureDate).toISOString(),
        reason: reason.trim(),
      };

      await createExpenditureApi(payload);

      setSuccess('Expenditure logged successfully!');
      setEquipmentId('');
      setBaseId('');
      setQuantity('');
      setExpenditureDate('');
      setReason('');
      setShowForm(false);

      fetchExpenditures();
    } catch (err) {
      console.error('Error logging expenditure:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to log expenditure.');
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
          <h2 className="page-title">Expenditures</h2>
          <p className="page-subtitle">Log expended, consumed, or lost military assets.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'Cancel' : 'Log Expenditure'}</span>
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Record Expenditure Form */}
      {showForm && (
        <div className="card">
          <h3 className="card-title">
            <span>Log Asset Expenditure</span>
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Equipment *</label>
                <select
                  className="form-select"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.equipmentType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Base *</label>
                <select
                  className="form-select"
                  value={baseId}
                  onChange={(e) => setBaseId(e.target.value)}
                  required
                >
                  <option value="">Select Base</option>
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expenditure Date *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={expenditureDate}
                  onChange={(e) => setExpenditureDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Reason / Justification *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Training exercise, Damaged in operation, Expired"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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
                {submitting ? 'Submitting...' : 'Save Expenditure'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenditure History Table */}
      {loading ? (
        <Loading message="Fetching expenditures..." />
      ) : expenditures.length === 0 ? (
        <div className="empty-state">No expenditure records found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Base</th>
                <th>Quantity Expended</th>
                <th>Expenditure Date</th>
                <th>Reason</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {expenditures.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <strong>{item.equipment?.name || 'N/A'}</strong>
                  </td>
                  <td>{item.base?.name || 'N/A'}</td>
                  <td>
                    <span className="badge badge-red">
                      -{item.quantity} {item.equipment?.unit || 'units'}
                    </span>
                  </td>
                  <td>{new Date(item.expenditureDate).toLocaleString()}</td>
                  <td>{item.reason}</td>
                  <td>{item.recordedBy?.username || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
