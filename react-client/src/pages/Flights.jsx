import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Plane, Calendar, Clock, Filter, ArrowUpDown, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function Flights() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [maxPrice, setMaxPrice] = useState(80000);
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [sortBy, setSortBy] = useState('price-asc');

  const originParam = searchParams.get('origin') || '';
  const destParam = searchParams.get('destination') || '';
  const dateParam = searchParams.get('date') || '';

  useEffect(() => {
    fetchFlights();
  }, [searchParams]);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFlights({
        origin: originParam,
        destination: destParam,
        date: dateParam
      });
      setFlights(data);
    } catch (err) {
      setError(err.message || 'Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  // Distinct airlines
  const airlines = ['ALL', ...new Set(flights.map(f => f.airline))];

  // Filtering & Sorting logic
  const filteredFlights = flights
    .filter(f => {
      const matchPrice = f.price <= maxPrice;
      const matchAirline = selectedAirline === 'ALL' || f.airline === selectedAirline;
      return matchPrice && matchAirline;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'departure') return new Date(a.departureTime) - new Date(b.departureTime);
      return 0;
    });

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateDuration = (dep, arr) => {
    if (!dep || !arr) return '2h 15m';
    const diffMs = new Date(arr) - new Date(dep);
    const diffMins = Math.round(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Search Header Banner */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            SEARCH RESULTS
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {originParam ? originParam : 'All Origins'} ➔ {destParam ? destParam : 'All Destinations'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {dateParam ? `Departing: ${dateParam}` : 'Showing all upcoming scheduled flights'} • {filteredFlights.length} flights found
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchFlights} 
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary btn-sm"
          >
            Modify Search
          </button>
        </div>
      </div>

      {/* Main Grid: Filters + Flights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '30px',
        alignItems: 'start',
        '@media (max-width: 900px)': { gridTemplateColumns: '1fr' }
      }}>
        {/* Left Filter Sidebar */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.1rem', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <Filter size={18} color="#2563eb" /> Filters
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Max Price:</span>
              <strong style={{ color: '#2563eb' }}>₹{maxPrice.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="2000"
              max="80000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>

          {/* Airlines Filter */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">Airlines</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {airlines.map((airline) => (
                <label key={airline} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="airline"
                    checked={selectedAirline === airline}
                    onChange={() => setSelectedAirline(airline)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>{airline === 'ALL' ? 'All Airlines' : airline}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="departure">Earliest Departure</option>
            </select>
          </div>
        </div>

        {/* Right Flight Cards List */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ color: '#64748b', fontWeight: 600 }}>Scanning scheduled airline departures...</p>
            </div>
          ) : error ? (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={22} />
              <div>
                <strong>Error fetching flights:</strong> {error}
              </div>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Plane size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>No flights matching your criteria</h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>Try adjusting your price filter or searching for a different destination.</p>
              <button
                onClick={() => {
                  setMaxPrice(80000);
                  setSelectedAirline('ALL');
                  navigate('/flights');
                }}
                className="btn btn-secondary"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {filteredFlights.map((flight) => (
                <div key={flight._id || flight.id} className="flight-card">
                  {/* Top Bar: Airline & Flight No */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        ✈
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{flight.airline}</span>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{flight.flightNumber} • Airbus A320</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        {flight.seatsAvailable} Seats Left
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        {flight.status || 'SCHEDULED'}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Route & Times */}
                  <div className="flight-route-flow">
                    {/* Origin */}
                    <div className="flight-point">
                      <div className="flight-time">{formatTime(flight.departureTime)}</div>
                      <div className="flight-city">{flight.origin}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{formatDate(flight.departureTime)}</div>
                    </div>

                    {/* Duration / Stops */}
                    <div className="flight-duration-line">
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                        {calculateDuration(flight.departureTime, flight.arrivalTime)}
                      </span>
                      <div className="route-bar">
                        <div className="route-plane-icon">
                          <Plane size={14} />
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Non-Stop</span>
                    </div>

                    {/* Destination */}
                    <div className="flight-point dest">
                      <div className="flight-time">{formatTime(flight.arrivalTime)}</div>
                      <div className="flight-city">{flight.destination}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{formatDate(flight.arrivalTime)}</div>
                    </div>
                  </div>

                  {/* Bottom: Price & CTA */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total per passenger</div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                        ₹{flight.price.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => navigate(`/book/${flight._id || flight.id}`)}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px' }}
                      >
                        Book Ticket ➔
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
