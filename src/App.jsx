import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import PickRequestsPage from './pages/PickRequestsPage';
import PickRequestDetailPage from './pages/PickRequestDetailPage';
import CreateRequestPage from './pages/CreateRequestPage';
import ScannerPage from './pages/ScannerPage';
import HealthPage from './pages/HealthPage';

// Scanner Components
import BarcodeScanner from './components/BarcodeScanner';
import RequesterScanner from './components/RequesterScanner';
import PickerScanner from './components/PickerScanner';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home */}
            <Route index element={<DashboardPage />} />

            {/* User Management (Admin Only) */}
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            {/* Products (All authenticated users) */}
            <Route path="products" element={<ProductsPage />} />

            {/* Pick Requests */}
            <Route path="pick-requests" element={<PickRequestsPage />} />
            <Route path="pick-requests/:name" element={<PickRequestDetailPage />} />

            {/* Create Pick Request - Manual (Requester/Admin) */}
            <Route
              path="create-request"
              element={
                <ProtectedRoute roles={['REQUESTER', 'ADMIN']}>
                  <CreateRequestPage />
                </ProtectedRoute>
              }
            />

            {/* Scanner - General Product Lookup (All users) */}
            <Route path="scanner" element={<ScannerPage />} />

            {/* Requester Scanner - Create requests via camera (Requester/Admin) */}
            <Route
              path="requester-scanner"
              element={
                <ProtectedRoute roles={['REQUESTER', 'ADMIN']}>
                  <RequesterScanner />
                </ProtectedRoute>
              }
            />

            {/* Picker Scanner - Fulfill requests via camera (Picker/Admin) */}
            <Route
              path="picker/:requestName"
              element={
                <ProtectedRoute roles={['PICKER', 'ADMIN']}>
                  <PickerScanner />
                </ProtectedRoute>
              }
            />

            {/* General Barcode Scanner Component (All users) */}
            <Route path="barcode-scanner" element={<BarcodeScanner />} />

            {/* System Health */}
            <Route path="health" element={<HealthPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
