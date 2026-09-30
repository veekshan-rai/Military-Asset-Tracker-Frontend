// src/components/StatCard.jsx
import React from 'react';

export default function StatCard({ label, value, icon: Icon, description, onClick, clickable }) {
  return (
    <div
      className={`stat-card ${clickable ? 'clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value">{value !== undefined ? value : 0}</div>
      {description && <div className="stat-footer">{description}</div>}
    </div>
  );
}
