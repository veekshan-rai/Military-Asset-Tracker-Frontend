// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { getDashboardApi, getBasesApi, getEquipmentApi } from '../services/api';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getUser } from '../utils/auth';
import {
  Scale,
  TrendingUp,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  TrendingDown,
} from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Role & assigned-base derived from session
  const currentUser = getUser() || {};
  const isAdmin = currentUser.role === 'ADMIN';
  const isRestrictedRole = currentUser.role === 'BASE_COMMANDER' || currentUser.role === 'LOGISTICS_OFFICER';
  const assignedBaseId = currentUser.assignedBaseId
    ? String(currentUser.assignedBaseId)
    : currentUser.assignedBase?.id
    ? String(currentUser.assignedBase.id)
    : '';
  const assignedBaseName =
    currentUser.assignedBaseName ||
    currentUser.assignedBase?.name ||
    '';

  // Filter options
  const [bases, setBases] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

  // Filter selections
  // Restricted roles (BASE_COMMANDER, LOGISTICS_OFFICER): pre-locked to their assignedBaseId; ADMIN: starts as '' (All Bases)
  const [selectedBaseId, setSelectedBaseId] = useState(
    isRestrictedRole ? assignedBaseId : ''
  );
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modal state for Net Movement details breakdown
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch dropdown options for filters (bases list only needed for ADMIN)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const equipRes = await getEquipmentApi();
        const types = Array.from(
          new Set((equipRes.data || []).map((e) => e.equipmentType).filter(Boolean))
        );
        setEquipmentList(types);

        // Only ADMIN needs the full base list
        if (isAdmin) {
          const basesRes = await getBasesApi();
          setBases(basesRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching filter dropdowns:', err);
      }
    };

    fetchOptions();
  }, [isAdmin]);

  // Fetch metrics whenever filters change
  const fetchDashboardMetrics = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (selectedBaseId) params.baseId = selectedBaseId;
      if (selectedEquipmentType) params.equipmentType = selectedEquipmentType;
      if (selectedDate) params.date = selectedDate;

      const response = await getDashboardApi(params);
      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedBaseId, selectedEquipmentType, selectedDate]);

  return (
    <div>
      {/* Page Header Standard */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Monitor inventory, asset movements, and military equipment.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Clean Filter Row */}
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-label">Base</label>

          {isRestrictedRole ? (
            // Restricted roles (BASE_COMMANDER, LOGISTICS_OFFICER): locked to their assigned base only
            assignedBaseId ? (
              <select
                className="form-select"
                value={assignedBaseId}
                disabled
                style={{ opacity: 1, cursor: 'default' }}
              >
                <option value={assignedBaseId}>{assignedBaseName || 'Assigned Base'}</option>
              </select>
            ) : (
              // Restricted role with no assigned base
              <select className="form-select" disabled>
                <option value="">No base assigned</option>
              </select>
            )
          ) : (
            // ADMIN: full base list with "All Bases"
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
          )}
        </div>

        <div className="filter-group">
          <label className="filter-label">Equipment Type</label>
          <select
            className="form-select"
            value={selectedEquipmentType}
            onChange={(e) => setSelectedEquipmentType(e.target.value)}
          >
            <option value="">All Types</option>
            {equipmentList.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Clear button: clears base filter for ADMIN; preserves assigned base for restricted roles */}
        {(isAdmin && (selectedBaseId || selectedEquipmentType || selectedDate)) ||
         (isRestrictedRole && (selectedEquipmentType || selectedDate)) ? (
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (isAdmin) setSelectedBaseId('');
              setSelectedEquipmentType('');
              setSelectedDate('');
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {loading ? (
        <Loading message="Loading metrics..." />
      ) : metrics ? (
        <>
          {/* Stat Cards Row 1 */}
          <div className="stats-grid">
            <StatCard
              label="Opening Balance"
              value={metrics.openingBalance}
              icon={Scale}
              description="Initial inventory total"
            />

            <StatCard
              label="Closing Balance"
              value={metrics.closingBalance}
              icon={Scale}
              description="Current total balance"
            />

            <StatCard
              label="Net Movement"
              value={metrics.netMovement > 0 ? `+${metrics.netMovement}` : metrics.netMovement}
              icon={TrendingUp}
              description="Click to view breakdown"
              clickable
              onClick={() => setIsModalOpen(true)}
            />

            <StatCard
              label="Purchases"
              value={metrics.purchases}
              icon={ShoppingCart}
              description="Total new procurements"
            />
          </div>

          {/* Stat Cards Row 2 */}
          <div className="stats-grid">
            <StatCard
              label="Transfer In"
              value={metrics.transferIn}
              icon={ArrowDownLeft}
              description="Items received from bases"
            />

            <StatCard
              label="Transfer Out"
              value={metrics.transferOut}
              icon={ArrowUpRight}
              description="Items sent to bases"
            />

            <StatCard
              label="Assigned"
              value={metrics.assigned}
              icon={UserCheck}
              description="Items assigned to personnel"
            />

            <StatCard
              label="Expended"
              value={metrics.expended}
              icon={TrendingDown}
              description="Items consumed or lost"
            />
          </div>
        </>
      ) : null}

      {/* Net Movement Breakdown Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Net Movement Breakdown"
      >
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
          Formula: Purchases + Transfer In - Transfer Out
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>Purchases (+)</span>
            <span style={{ fontWeight: '700', color: '#166534' }}>
              +{metrics?.purchases || 0}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>Transfer In (+)</span>
            <span style={{ fontWeight: '700', color: '#166534' }}>
              +{metrics?.transferIn || 0}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>Transfer Out (-)</span>
            <span style={{ fontWeight: '700', color: '#991b1b' }}>
              -{metrics?.transferOut || 0}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
              marginTop: '4px',
            }}
          >
            <span style={{ fontWeight: '700', color: '#1e40af' }}>Net Movement</span>
            <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '1rem' }}>
              {metrics?.netMovement > 0 ? `+${metrics.netMovement}` : metrics?.netMovement || 0}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
