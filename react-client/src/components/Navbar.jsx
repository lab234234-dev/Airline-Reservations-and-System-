import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plane, User, LogOut, CheckCircle2, ShieldCheck, Ticket, UserCircle, Menu, X, Award } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const isAdminOrAgent = user && (user.role === 'admin' || user.role === 'agent');
  const isAdmin = user && user.role === 'admin';

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-wrapper">
            <Plane size={22} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <span>SkyHigh<span style={{ color: 'var(--primary)' }}>Air</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links" style={{ display: 'none', '@media (min-width: 768px)': { display: 'flex' } }}>
          <NavLink to="/flights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Flights
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About Airline
          </NavLink>
          <NavLink to="/checkin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CheckCircle2 size={16} /> Web Check-In
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Trips
            </NavLink>
          )}
          {isAdminOrAgent && (
            <NavLink to="/counter-booking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Ticket size={16} /> Counter Desk
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={16} /> Admin Portal
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Miles Badge */}
              <div 
                className="badge badge-warning" 
                title="Frequent Flyer Reward Points"
                style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'default' }}
              >
                <Award size={14} />
                <span>{user.reward_points || user.rewardPoints || 250} Pts</span>
              </div>

              {/* Profile link */}
              <Link 
                to="/dashboard" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: 600, 
                  fontSize: '0.9rem',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                  border: '2px solid #3b82f6',
                  flexShrink: 0
                }}>
                  {(user.profile_pic || user.profilePic) ? (
                    <img 
                      src={user.profile_pic || user.profilePic} 
                      alt={user.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 20px',
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link to="/flights" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>
            ✈️ Search Flights
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>
            🏢 About SkyHigh Air
          </Link>
          <Link to="/checkin" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>
            ✅ Web Check-In
          </Link>
          {user && (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>
              👤 My Dashboard & Trips
            </Link>
          )}
          {isAdminOrAgent && (
            <Link to="/counter-booking" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>
              🎫 Airport Counter Desk
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', fontWeight: 600 }}>
              🛡️ Admin Management
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
