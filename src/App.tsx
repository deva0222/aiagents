/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

// Public Pages
import { Home } from './pages/public/Home';
import { Services } from './pages/public/Services';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { RequestProject } from './pages/public/RequestProject';
import { About } from './pages/public/About';
import { Portfolio } from './pages/public/Portfolio';
import { Pricing } from './pages/public/Pricing';
import { Blog } from './pages/public/Blog';
import { FAQ } from './pages/public/FAQ';
import { Contact } from './pages/public/Contact';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Dashboards
import { ClientDashboard } from './pages/client/Dashboard';
import { ClientProject } from './pages/client/ClientProject';
import { ClientProjectsList } from './pages/client/ClientProjectsList';
import { ClientRequests } from './pages/client/ClientRequests';
import { ClientMessages } from './pages/client/ClientMessages';
import { ClientSupport } from './pages/client/ClientSupport';
import { ClientInvoices } from './pages/client/ClientInvoices';

import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminRequests } from './pages/admin/AdminRequests';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminClients } from './pages/admin/AdminClients';

const queryClient = new QueryClient();

export { useAuth };

const ProtectedRoute = ({ 
  children, 
  requireRole 
}: { 
  children: React.ReactNode; 
  requireRole?: 'ADMIN' | 'CLIENT' 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectTarget}`} replace />;
  }

  if (requireRole && user?.role !== requireRole && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AuthModal />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="about" element={<About />} />
              <Route path="blog" element={<Blog />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              
              {/* Project Request Flow - Authenticated only */}
              <Route 
                path="project-request" 
                element={
                  <ProtectedRoute>
                    <RequestProject />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="request" 
                element={
                  <ProtectedRoute>
                    <RequestProject />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Client Portal Routes (/client & legacy /portal) */}
            <Route path="/client" element={
              <ProtectedRoute requireRole="CLIENT">
                <DashboardLayout role="CLIENT" />
              </ProtectedRoute>
            }>
              <Route index element={<ClientDashboard />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="requests" element={<ClientRequests />} />
              <Route path="projects" element={<ClientProjectsList />} />
              <Route path="projects/:id" element={<ClientProject />} />
              <Route path="messages" element={<ClientMessages />} />
              <Route path="support" element={<ClientSupport />} />
              <Route path="invoices" element={<ClientInvoices />} />
            </Route>

            {/* Legacy Portal fallback redirect to /client */}
            <Route path="/portal/*" element={<Navigate to="/client" replace />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireRole="ADMIN">
                <DashboardLayout role="ADMIN" />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="clients" element={<AdminClients />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
