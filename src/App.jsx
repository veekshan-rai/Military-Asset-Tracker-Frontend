// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protected Route Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import Expenditures from './pages/Expenditures';
import Stock from './pages/Stock';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Bases from './pages/Bases';
import Equipment from './pages/Equipment';

// Layout wrapper component for protected internal pages
function MainLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Workspace Area */}
      <div className="content-area">
        <Header
          pageTitle={title}
          toggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          mobileOpen={mobileOpen}
        />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout title="Executive Dashboard">
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <MainLayout title="Equipment Purchases">
              <Purchases />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transfers"
        element={
          <ProtectedRoute>
            <MainLayout title="Inter-Base Transfers">
              <Transfers />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
            <MainLayout title="Personnel Asset Assignments">
              <Assignments />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenditures"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'BASE_COMMANDER']}>
            <MainLayout title="Asset Expenditures & Consumption">
              <Expenditures />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <MainLayout title="Live Stock Inventory">
              <Stock />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout title="System Audit Logs">
              <AuditLogs />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout title="User Management">
              <Users />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bases"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout title="Military Bases">
              <Bases />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/equipment"
        element={
          <ProtectedRoute>
            <MainLayout title="Equipment Catalog">
              <Equipment />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
