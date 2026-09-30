// src/pages/Purchases.jsx
import React, { useState, useEffect } from 'react';
import {
  getPurchasesApi,
  createPurchaseApi,
  getEquipmentApi,
  getBasesApi,
} from '../services/api';
import { getUser } from '../utils/auth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { PlusCircle } from 'lucide-react';

export default function Purchases() {
  const currentUser = getUser() || {};
  const isBaseCommander = currentUser.role === 'BASE_COMMANDER';
  const assignedBaseId = currentUser.assignedBaseId
    ? String(currentUser.assignedBaseId)
    : currentUser.assignedBase?.id
    ? String(currentUser.assignedBase.id)
    : '';
  const assignedBaseName =
    currentUser.assignedBaseName ||
    currentUser.assignedBase?.name ||
    '';

  const [purchases, setPurchases] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [equipmentId, setEquipmentId] = useState('');
  const [baseId, setBaseId] = useState(isBaseCommander ? assignedBaseId : '');
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter State
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const promises = [getEquipmentApi()];
        if (!isBaseCommander) {
          promises.push(getBasesApi());
        }
        const [equipRes, basesRes] = await Promise.all(promises);
        setEquipmentList(equipRes.data || []);
        if (basesRes) {
          setBases(basesRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load dropdown options:', err);
      }
    };
    fetchDropdownData();
  }, [isBaseCommander]);

  const fetchPurchases = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterType) params.equipmentType = filterType;
      if (filterDate) params.date = filterDate;

      const response = await getPurchasesApi(params);
      setPurchases(response.data || []);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to fetch purchase records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [filterType, filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const effectiveBaseId = isBaseCommander ? assignedBaseId : baseId;

    if (isBaseCommander && !assignedBaseId) {
      setError('You must have an assigned base to record purchases.');
      return;
    }

    if (!equipmentId || !effectiveBaseId || !quantity || !purchaseDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        equipment: { id: parseInt(equipmentId) },
        base: { id: parseInt(effectiveBaseId) },
        quantity: parseInt(quantity),
        purchaseDate: new Date(purchaseDate).toISOString(),
      };

      await createPurchaseApi(payload);

      setSuccess('Purchase recorded successfully!');
      setEquipmentId('');
      setBaseId(isBaseCommander ? assignedBaseId : '');
      setQuantity('');
      setPurchaseDate('');
      setShowForm(false);

      fetchPurchases();
    } catch (err) {
      console.error('Error creating purchase:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create purchase record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const equipmentTypes = Array.from(
    new Set(equipmentList.map((e) => e.equipmentType).filter(Boolean))
  );

  return (
    <div>
      {/* Standard Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Purchases</h2>
          <p className="page-subtitle">Record and review equipment purchases.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            if (!showForm && isBaseCommander) {
              setBaseId(assignedBaseId);
            }
            setShowForm(!showForm);
          }}
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'Cancel' : 'Record Purchase'}</span>
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Record Purchase Form Card */}
      {showForm && (
        <div className="card">
          <h3 className="card-title">
            <span>New Purchase Record</span>
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
                <label className="form-label">Receiving Base *</label>
                {isBaseCommander ? (
                  assignedBaseId ? (
                    <select
                      className="form-select"
                      value={assignedBaseId}
                      disabled
                      style={{ opacity: 1, cursor: 'default' }}
                    >
                      <option value={assignedBaseId}>
                        {assignedBaseName || 'Assigned Base'}
                      </option>
                    </select>
                  ) : (
                    <select className="form-select" disabled>
                      <option value="">No base assigned</option>
                    </select>
                  )
                ) : (
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
                )}
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
                <label className="form-label">Purchase Date *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
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
                {submitting ? 'Saving...' : 'Save Purchase'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Row */}
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">Filter Equipment Type</label>
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {equipmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Filter Date</label>
          <input
            type="date"
            className="form-input"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {(filterType || filterDate) && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFilterType('');
              setFilterDate('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Purchase History Table */}
      {loading ? (
        <Loading message="Fetching purchases..." />
      ) : purchases.length === 0 ? (
        <div className="empty-state">No purchase records found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Base</th>
                <th>Quantity</th>
                <th>Purchase Date</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <strong>{item.equipment?.name || 'N/A'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {item.equipment?.equipmentType}
                    </div>
                  </td>
                  <td>{item.base?.name || 'N/A'}</td>
                  <td>
                    <span className="badge badge-green">
                      +{item.quantity} {item.equipment?.unit || 'units'}
                    </span>
                  </td>
                  <td>{new Date(item.purchaseDate).toLocaleString()}</td>
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
