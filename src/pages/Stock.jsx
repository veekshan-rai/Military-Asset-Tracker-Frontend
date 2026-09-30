// src/pages/Stock.jsx
import React, { useState, useEffect } from 'react';
import { getStockApi, getBasesApi } from '../services/api';
import { getUser } from '../utils/auth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Stock() {
  const [stockList, setStockList] = useState([]);
  const [bases, setBases] = useState([]);
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = getUser() || {};
  const isBaseCommander = currentUser.role === 'BASE_COMMANDER';

  useEffect(() => {
    if (!isBaseCommander) {
      getBasesApi()
        .then((res) => setBases(res.data || []))
        .catch((err) => console.error('Error fetching bases:', err));
    }
  }, [isBaseCommander]);

  const fetchStock = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getStockApi(selectedBaseId || null);
      setStockList(response.data || []);
    } catch (err) {
      console.error('Error fetching stock:', err);
      setError('Failed to fetch stock records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [selectedBaseId]);

  return (
    <div>
      {/* Standard Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Stock</h2>
          <p className="page-subtitle">View active stock inventory across military bases.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Filter Row */}
      {!isBaseCommander && (
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Base</label>
            <select
              className="form-select"
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
            >
              <option value="">All Bases</option>
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name} ({base.location})
                </option>
              ))}
            </select>
          </div>

          {selectedBaseId && (
            <button className="btn btn-secondary" onClick={() => setSelectedBaseId('')}>
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Stock Table */}
      {loading ? (
        <Loading message="Fetching stock levels..." />
      ) : stockList.length === 0 ? (
        <div className="empty-state">No stock records found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock ID</th>
                <th>Equipment Name</th>
                <th>Equipment Type</th>
                <th>Unit</th>
                <th>Base</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {stockList.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <strong>{item.equipment?.name || 'N/A'}</strong>
                  </td>
                  <td>
                    <span className="badge badge-blue">{item.equipment?.equipmentType || 'N/A'}</span>
                  </td>
                  <td>{item.equipment?.unit || 'N/A'}</td>
                  <td>
                    <strong>{item.base?.name || 'N/A'}</strong> ({item.base?.location || 'N/A'})
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.quantity > 50
                          ? 'badge-green'
                          : item.quantity > 10
                          ? 'badge-amber'
                          : 'badge-red'
                      }`}
                    >
                      {item.quantity} {item.equipment?.unit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
