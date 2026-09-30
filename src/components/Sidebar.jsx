// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  UserCheck,
  TrendingDown,
  Boxes,
  FileText,
  Users,
  Building2,
  Shield,
  Crosshair,
  LogOut,
  X,
  User as UserIcon,
} from 'lucide-react';
import { getUser, logout } from '../utils/auth';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const user = getUser() || {};
  const role = user.role || 'LOGISTICS_OFFICER';
  const roleDisplay = role.replace(/_/g, ' ');

  // Navigation Items per Role
  const allNavItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
    {
      title: 'Purchases',
      path: '/purchases',
      icon: ShoppingCart,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
    {
      title: 'Transfers',
      path: '/transfers',
      icon: ArrowLeftRight,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
    {
      title: 'Assignments',
      path: '/assignments',
      icon: UserCheck,
      roles: ['ADMIN', 'BASE_COMMANDER'],
    },
    {
      title: 'Expenditures',
      path: '/expenditures',
      icon: TrendingDown,
      roles: ['ADMIN', 'BASE_COMMANDER'],
    },
    {
      title: 'Stock',
      path: '/stock',
      icon: Boxes,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
    {
      title: 'Audit Logs',
      path: '/audit-logs',
      icon: FileText,
      roles: ['ADMIN'],
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      title: 'Bases',
      path: '/bases',
      icon: Building2,
      roles: ['ADMIN'],
    },
    {
      title: 'Equipment',
      path: '/equipment',
      icon: Shield,
      roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'],
    },
  ];

  // Filter items visible to current user's role
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(role));

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-brand-icon">
              <Crosshair size={18} />
            </div>
            <span className="sidebar-brand-title">MAT SYSTEM</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User profile card in sidebar for mobile navigation */}
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            <UserIcon size={16} />
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user.username || 'User'}</span>
            <span className="badge badge-blue sidebar-user-badge">{roleDisplay}</span>
            {user.assignedBaseName && (
              <span className="sidebar-user-base">{user.assignedBaseName}</span>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <IconComponent size={16} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Logout for mobile convenience */}
        <div className="sidebar-footer">
          <button
            className="btn btn-secondary sidebar-logout-btn"
            onClick={logout}
            aria-label="Sign out of system"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
