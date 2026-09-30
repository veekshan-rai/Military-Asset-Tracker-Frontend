// src/pages/Transfers.jsx
import React, { useState, useEffect } from 'react';
import {
  getTransfersApi,
  createTransferApi,
  getEquipmentApi,
  getBasesApi,
} from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { PlusCircle } from 'lucide-react';

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [equipmentId, setEquipmentId] = useState('');
  const [fromBaseId, setFromBaseId] = useState('');
  const [toBaseId, setToBaseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [transferDate, setTransferDate] = useState('');

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

  const fetchTransfers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getTransfersApi();
      setTransfers(response.data || []);
    } catch (err) {
      console.error('Error fetching transfers:', err);
      setError('Failed to fetch transfer history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fromBaseId === toBaseId) {
      setError('From Base and To Base cannot be the same base.');
      return;
    }

    if (!equipmentId || !fromBaseId || !toBaseId || !quantity || !transferDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        equipment: { id: parseInt(equipmentId) },
        fromBase: { id: parseInt(fromBaseId) },
        toBase: { id: parseInt(toBaseId) },
        quantity: parseInt(quantity),
        transferDate: new Date(transferDate).toISOString(),
      };

      await createTransferApi(payload);

      setSuccess('Transfer record created successfully!');
      setEquipmentId('');
      setFromBaseId('');
      setToBaseId('');
      setQuantity('');
      setTransferDate('');
      setShowForm(false);

      fetchTransfers();
    } catch (err) {
      console.error('Error creating transfer:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to record transfer.');
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
          <h2 className="page-title">Transfers</h2>
          <p className="page-subtitle">Transfer military equipment and supplies between bases.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'Cancel' : 'Initiate Transfer'}</span>
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Record Transfer Form */}
      {showForm && (
        <div className="card">
          <h3 className="card-title">
            <span>New Inter-Base Transfer</span>
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
                <label className="form-label">From Base (Source) *</label>
                <select
                  className="form-select"
                  value={fromBaseId}
                  onChange={(e) => setFromBaseId(e.target.value)}
                  required
                >
                  <option value="">Select Source Base</option>
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">To Base (Destination) *</label>
                <select
                  className="form-select"
                  value={toBaseId}
                  onChange={(e) => setToBaseId(e.target.value)}
                  required
                >
                  <option value="">Select Destination Base</option>
                  {bases
                    .filter((b) => b.id.toString() !== fromBaseId)
                    .map((b) => (
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
                <label className="form-label">Transfer Date *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
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
                {submitting ? 'Executing...' : 'Execute Transfer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer History Table */}
      {loading ? (
        <Loading message="Fetching transfers..." />
      ) : transfers.length === 0 ? (
        <div className="empty-state">No transfer records found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>From Base</th>
                <th>To Base</th>
                <th>Quantity</th>
                <th>Transfer Date</th>
                <th>Transferred By</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <strong>{item.equipment?.name || 'N/A'}</strong>
                  </td>
                  <td>
                    <span className="badge badge-amber">{item.fromBase?.name || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="badge badge-blue">{item.toBase?.name || 'N/A'}</span>
                  </td>
                  <td>
                    {item.quantity} {item.equipment?.unit || 'units'}
                  </td>
                  <td>{new Date(item.transferDate).toLocaleString()}</td>
                  <td>{item.transferredBy?.username || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
