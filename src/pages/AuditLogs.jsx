// src/pages/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import { getAuditLogsApi } from '../services/api';
import { getUser } from '../utils/auth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { AlertCircle } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = getUser() || {};
  const isAdmin = currentUser.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchAuditLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getAuditLogsApi();
        setLogs(response.data || []);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('Failed to fetch audit logs from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>
            <strong>Access Denied:</strong> This page is restricted to System Administrators.
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
          <h2 className="page-title">Audit Logs</h2>
          <p className="page-subtitle">System activity and audit history log.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading message="Fetching audit logs..." />
      ) : logs.length === 0 ? (
        <div className="empty-state">No audit log entries found.</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>Performed By</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td>
                    <span className="badge badge-purple">{log.action}</span>
                  </td>
                  <td>
                    <span className="badge badge-blue">{log.entityType}</span>
                  </td>
                  <td>#{log.entityId}</td>
                  <td>
                    <strong>{log.performedBy?.username || 'System'}</strong>
                  </td>
                  <td>{log.description}</td>
                  <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
