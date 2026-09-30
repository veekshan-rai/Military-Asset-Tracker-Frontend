// src/pages/Assignments.jsx
import React, { useState, useEffect } from 'react';
import {
  getAssignmentsApi,
  createAssignmentApi,
  getEquipmentApi,
  getBasesApi,
} from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { PlusCircle } from 'lucide-react';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [equipmentId, setEquipmentId] = useState('');
  const [baseId, setBaseId] = useState('');
  const [personnelName, setPersonnelName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [assignmentDate, setAssignmentDate] = useState('');

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

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAssignmentsApi();
      setAssignments(response.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to fetch assignment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipmentId || !baseId || !personnelName || !quantity || !assignmentDate) {
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
        personnelName: personnelName.trim(),
        quantity: parseInt(quantity),
        assignmentDate: new Date(assignmentDate).toISOString(),
      };

      await createAssignmentApi(payload);

      setSuccess('Equipment assigned successfully!');
      setEquipmentId('');
      setBaseId('');
      setPersonnelName('');
      setQuantity('');
      setAssignmentDate('');
      setShowForm(false);

      fetchAssignments();
    } catch (err) {
      console.error('Error creating assignment:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to record assignment.');
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
          <h2 className="page-title">Assignments</h2>
          <p className="page-subtitle">Assign equipment and armaments to military personnel.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle size={16} />
          <span>{showForm ? 'Cancel' : 'New Assignment'}</span>
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Record Assignment Form */}
      {showForm && (
        <div className="card card-animate-in">
          <h3 className="card-title">
            <span>Assign Equipment</span>
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
                <label className="form-label">Personnel Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sgt. John Smith"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  required
                />
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
                <label className="form-label">Assignment Date *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={assignmentDate}
                  onChange={(e) => setAssignmentDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions-responsive">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Assigning...' : 'Save Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignment History Table */}
      {loading ? (
        <Loading message="Fetching assignments..." />
      ) : assignments.length === 0 ? (
        <div className="empty-state">No assignment records found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Base</th>
                <th>Personnel Name</th>
                <th>Quantity</th>
                <th>Assignment Date</th>
                <th>Assigned By</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <strong>{item.equipment?.name || 'N/A'}</strong>
                  </td>
                  <td>{item.base?.name || 'N/A'}</td>
                  <td>
                    <span className="badge badge-purple">{item.personnelName}</span>
                  </td>
                  <td>
                    {item.quantity} {item.equipment?.unit || 'units'}
                  </td>
                  <td>{new Date(item.assignmentDate).toLocaleString()}</td>
                  <td>{item.assignedBy?.username || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
