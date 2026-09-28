import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Plane, Users, Ticket, TrendingUp, BarChart3, ShieldCheck, 
  Plus, Edit2, Trash2, Search, DollarSign, CheckCircle2, AlertCircle, X, Save
} from 'lucide-react';

export default function AdminDashboard() {
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flights'); // 'flights' | 'bookings' | 'analytics'

  // Modals for flight creation / editing
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editingFlightId, setEditingFlightId] = useState(null);
  const [flightForm, setFlightForm] = useState({
    flightNumber: '',
    airline: 'SkyHigh Air',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: 3500,
    totalSeats: 150,
    seatsAvailable: 150,
    status: 'scheduled'
  });

  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, flightsData, bookingsData] = await Promise.all([
        api.getAdminStats(),
        api.getFlights(),
        api.getAllBookings()
      ]);
      setStats(statsData);
      setFlights(flightsData);
      setBookings(bookingsData);
    } catch (err) {
      addToast(err.message || 'Error loading administrator data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingFlightId(null);
    setFlightForm({
      flightNumber: 'SH-' + Math.floor(100 + Math.random() * 900),
      airline: 'SkyHigh Air',
      origin: 'Mumbai',
      destination: 'Delhi',
      departureTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      arrivalTime: new Date(Date.now() + 93600000).toISOString().slice(0, 16),
      price: 4500,
      totalSeats: 160,
      seatsAvailable: 160,
      status: 'scheduled'
    });
    setShowFlightModal(true);
  };

  const handleOpenEditModal = (flight) => {
    setEditingFlightId(flight._id || flight.id);
    setFlightForm({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime ? flight.departureTime.slice(0, 16) : '',
      arrivalTime: flight.arrivalTime ? flight.arrivalTime.slice(0, 16) : '',
      price: flight.price,
      totalSeats: flight.totalSeats,
      seatsAvailable: flight.seatsAvailable,
      status: flight.status || 'scheduled'
    });
    setShowFlightModal(true);
  };

  const handleSaveFlight = async (e) => {
    e.preventDefault();
    try {
      if (editingFlightId) {
        await api.updateFlight(editingFlightId, flightForm);
        addToast('Flight schedule updated successfully!', 'success');
      } else {
        await api.addFlight(flightForm);
        addToast('New flight added to fleet schedule!', 'success');
      }
      setShowFlightModal(false);
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Error saving flight', 'error');
    }
  };

  const handleDeleteFlight = async (id) => {
    if (!window.confirm('Are you sure you want to remove this flight schedule?')) return;
    try {
      await api.deleteFlight(id);
      addToast('Flight schedule removed from fleet', 'info');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Error deleting flight', 'error');
    }
  };

  const filteredFlights = flights.filter(f => 
    f.flightNumber?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.airline?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.origin?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.destination?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
            <ShieldCheck size={14} /> SYSTEM CONTROL PANEL
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            Airline Fleet Operations & Admin
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Live fleet schedules, revenue analytics, passenger manifests, and flight capacity control.
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Schedule New Flight
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>TOTAL REVENUE</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{(stats?.revenue || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>↑ +14.2% this month</span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>FLEET FLIGHTS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plane size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {stats?.totalFlights || flights.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>Active routes</span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>PASSENGER BOOKINGS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {stats?.totalBookings || bookings.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600 }}>Confirmed tickets</span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>OCCUPANCY RATE</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {stats?.occupancyRate || 82}%
          </div>
          <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>Avg seat fill factor</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('flights')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'flights' ? '#2563eb' : 'white',
            color: activeTab === 'flights' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            fontWeight: 700
          }}
        >
          <Plane size={16} /> Scheduled Flights ({flights.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'bookings' ? '#2563eb' : 'white',
            color: activeTab === 'bookings' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            fontWeight: 700
          }}
        >
          <Ticket size={16} /> Passenger Manifests ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'analytics' ? '#2563eb' : 'white',
            color: activeTab === 'analytics' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            fontWeight: 700
          }}
        >
          <TrendingUp size={16} /> Route & Revenue Analytics
        </button>
      </div>

      {/* Tab 1: Flights Management */}
      {activeTab === 'flights' && (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search flight number, airline, or route..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '0.9rem', width: '280px' }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {filteredFlights.length} of {flights.length} flights
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '14px 20px' }}>FLIGHT</th>
                  <th style={{ padding: '14px 20px' }}>AIRLINE</th>
                  <th style={{ padding: '14px 20px' }}>ORIGIN ➔ DESTINATION</th>
                  <th style={{ padding: '14px 20px' }}>DEPARTURE</th>
                  <th style={{ padding: '14px 20px' }}>SEATS</th>
                  <th style={{ padding: '14px 20px' }}>BASE FARE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((f) => (
                  <tr key={f._id || f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0f172a' }}>
                      {f.flightNumber}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                      {f.airline}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2563eb' }}>
                      {f.origin} ➔ {f.destination}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>
                      {f.departureTime ? new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${f.seatsAvailable > 30 ? 'badge-success' : 'badge-warning'}`}>
                        {f.seatsAvailable} / {f.totalSeats}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 800 }}>
                      ₹{f.price?.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(f)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Flight"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteFlight(f._id || f.id)}
                          className="btn btn-danger btn-sm"
                          title="Delete Flight"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings Manifest */}
      {activeTab === 'bookings' && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '14px 20px' }}>PNR</th>
                  <th style={{ padding: '14px 20px' }}>PASSENGER / USER</th>
                  <th style={{ padding: '14px 20px' }}>FLIGHT & ROUTE</th>
                  <th style={{ padding: '14px 20px' }}>SEAT</th>
                  <th style={{ padding: '14px 20px' }}>AMOUNT</th>
                  <th style={{ padding: '14px 20px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id || b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: '#2563eb' }}>
                      {b.pnr}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(b.user?.profilePic || b.user?.profile_pic) ? (
                          <img 
                            src={b.user.profilePic || b.user.profile_pic} 
                            alt="Passenger" 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1', flexShrink: 0 }} 
                          />
                        ) : (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#e2e8f0',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {(b.user?.name || b.passengers?.[0]?.name || 'P').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <strong style={{ color: '#0f172a' }}>{b.user?.name || b.passengers?.[0]?.name || 'Passenger'}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.user?.email || 'Walk-in Guest'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div>{b.airline || b.flight?.airline} {b.flightNumber || b.flight?.flightNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.origin} ➔ {b.destination}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#16a34a' }}>
                      {b.seatNumber || '12A'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 800 }}>
                      ₹{b.totalAmount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {b.bookingStatus === 'cancelled' ? (
                        <span className="badge badge-danger">CANCELLED</span>
                      ) : b.checkInStatus === 'completed' ? (
                        <span className="badge badge-success">CHECKED IN</span>
                      ) : (
                        <span className="badge badge-warning">CONFIRMED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Top Routes */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
              Most Popular Flight Corridors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(stats?.routeStats || []).map((route, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{route._id}</span>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#2563eb' }}>{route.count} bookings</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{(route.revenue || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Airline Market Share */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>
              Revenue by Airline Fleet
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(stats?.airlineStats || []).map((a, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{a._id}</span>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#16a34a' }}>₹{(a.revenue || 0).toLocaleString()}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.count} flights booked</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Flight Create / Edit Modal */}
      {showFlightModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px', maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {editingFlightId ? 'Edit Flight Schedule' : 'Schedule New Flight'}
              </h3>
              <button onClick={() => setShowFlightModal(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFlight}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Flight Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={flightForm.flightNumber}
                    onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Airline Carrier</label>
                  <input
                    type="text"
                    className="form-input"
                    value={flightForm.airline}
                    onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Origin City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={flightForm.origin}
                    onChange={(e) => setFlightForm({ ...flightForm, origin: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Destination City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={flightForm.destination}
                    onChange={(e) => setFlightForm({ ...flightForm, destination: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Departure Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={flightForm.departureTime}
                    onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Arrival Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={flightForm.arrivalTime}
                    onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Base Ticket Price (₹)</label>
                  <input
                    type="number"
                    min="500"
                    className="form-input"
                    value={flightForm.price}
                    onChange={(e) => setFlightForm({ ...flightForm, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Aircraft Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    className="form-input"
                    value={flightForm.totalSeats}
                    onChange={(e) => setFlightForm({ ...flightForm, totalSeats: Number(e.target.value), seatsAvailable: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Save size={16} /> {editingFlightId ? 'Save Changes' : 'Confirm Flight Addition'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
