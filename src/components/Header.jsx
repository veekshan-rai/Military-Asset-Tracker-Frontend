// src/components/Header.jsx
import React from 'react';
import { Menu, LogOut, X } from 'lucide-react';
import { getUser, logout } from '../utils/auth';

export default function Header({ pageTitle, toggleMobileSidebar, mobileOpen }) {
  const user = getUser() || {};
  
  // Format role for badge display (e.g. LOGISTICS_OFFICER -> LOGISTICS OFFICER)
  const roleDisplay = user.role ? user.role.replace(/_/g, ' ') : 'USER';

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileSidebar}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="header-title">{pageTitle || 'Military Asset Tracker'}</h1>
        <span className="header-brand-mobile">MAT SYSTEM</span>
      </div>

      <div className="header-user-section">
        <div className="header-user-info">
          <span className="header-username">{user.username || 'User'}</span>
          <span className="badge badge-blue">{roleDisplay}</span>
        </div>

        <button
          className="btn btn-secondary header-logout-btn"
          onClick={logout}
          title="Sign out of system"
          aria-label="Sign out"
        >
          <LogOut size={14} />
          <span className="logout-btn-text">Logout</span>
        </button>
      </div>
    </header>
  );
}
