import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import AddMember from './pages/AddMember';
import EditMember from './pages/EditMember';
import MemberDetails from './pages/MemberDetails';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoiceDetails from './pages/InvoiceDetails';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <DashboardLayout>{children}</DashboardLayout>;
};

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/members"
                element={
                    <ProtectedRoute>
                        <Members />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/members/add"
                element={
                    <ProtectedRoute>
                        <AddMember />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/members/edit/:id"
                element={
                    <ProtectedRoute>
                        <EditMember />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/members/:id"
                element={
                    <ProtectedRoute>
                        <MemberDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoices"
                element={
                    <ProtectedRoute>
                        <Invoices />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoices/create"
                element={
                    <ProtectedRoute>
                        <CreateInvoice />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoices/edit/:id"
                element={
                    <ProtectedRoute>
                        <EditInvoice />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoices/:id"
                element={
                    <ProtectedRoute>
                        <InvoiceDetails />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <Settings />
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                    <Toaster position="top-right" />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
