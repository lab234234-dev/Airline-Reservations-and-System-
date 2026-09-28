import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Flights from './pages/Flights';
import BookTicket from './pages/BookTicket';
import Checkin from './pages/Checkin';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CounterBooking from './pages/CounterBooking';
import AboutCompany from './pages/AboutCompany';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutCompany />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/book/:id" element={<BookTicket />} />
                <Route path="/checkin" element={<Checkin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />

                {/* Agent & Admin Counter Desk */}
                <Route 
                  path="/counter-booking" 
                  element={
                    <ProtectedRoute adminOnly={true} agentAllowed={true}>
                      <CounterBooking />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Management Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly={true} agentAllowed={false}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute adminOnly={true} agentAllowed={false}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
