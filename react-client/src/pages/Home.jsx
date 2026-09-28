import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, Users, MapPin, Search, ArrowRight, ShieldCheck, Clock, Award, Sparkles, CheckCircle2 } from 'lucide-react';

const CITIES = [
  'Surat', 'Mumbai', 'Ahmedabad', 'Delhi', 'Bangalore', 'Goa',
  'Jaipur', 'Kolkata', 'Chennai', 'Srinagar', 'Kochi', 'Hyderabad',
  'Pune', 'Dubai', 'London', 'Singapore', 'New York', 'Bangkok', 'Paris'
];

export default function Home() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('one-way');
  const [origin, setOrigin] = useState('Surat');
  const [destination, setDestination] = useState('Mumbai');
  const [departDate, setDepartDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (departDate) params.append('date', departDate);
    params.append('passengers', passengers);
    params.append('class', travelClass);
    navigate(`/flights?${params.toString()}`);
  };

  const swapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #090e17 0%, #0f172a 60%, #1e3a8a 100%)',
        color: 'white',
        padding: '70px 0 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px', marginBottom: '40px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 14px', 
              borderRadius: '9999px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#38bdf8',
              marginBottom: '20px'
            }}>
              <Sparkles size={16} /> Next-Gen Aviation Platform
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '20px'
            }}>
              Fly Beyond Horizons With <span style={{ 
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>SkyHigh Air</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '620px'
            }}>
              Seamless domestic & international reservations, instant web check-in, real-time aircraft seat selection, and 24/7 airport desk operations.
            </p>
          </div>

          {/* Search Engine Card */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            color: 'var(--light-text)'
          }}>
            {/* Trip Type Tabs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setTripType('one-way')}
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: tripType === 'one-way' ? '#eff6ff' : 'transparent',
                  color: tripType === 'one-way' ? '#2563eb' : '#64748b'
                }}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('round-trip')}
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: tripType === 'round-trip' ? '#eff6ff' : 'transparent',
                  color: tripType === 'round-trip' ? '#2563eb' : '#64748b'
                }}
              >
                Round Trip
              </button>
            </div>

            {/* Flight Search Form */}
            <form onSubmit={handleSearch}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                alignItems: 'flex-end'
              }}>
                {/* Origin */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="#2563eb" /> From / Origin
                  </label>
                  <select 
                    className="form-select" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} disabled={c === destination}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Swap button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  <button
                    type="button"
                    onClick={swapCities}
                    title="Swap Cities"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      transition: 'all 0.2s'
                    }}
                  >
                    ⇄
                  </button>
                </div>

                {/* Destination */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plane size={15} color="#2563eb" /> To / Destination
                  </label>
                  <select 
                    className="form-select" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} disabled={c === origin}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#2563eb" /> Departure Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    required
                  />
                </div>

                {/* Passengers */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} color="#2563eb" /> Travelers & Class
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-select"
                      style={{ width: '45%' }}
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                      ))}
                    </select>
                    <select
                      className="form-select"
                      style={{ width: '55%' }}
                      value={travelClass}
                      onChange={(e) => setTravelClass(e.target.value)}
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Prem. Econ</option>
                      <option value="Business">Business</option>
                      <option value="First Class">First Class</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', height: '48px' }}>
                    <Search size={18} /> Search Flights
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>CURATED FARES</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Trending Global Destinations</h2>
            </div>
            <button 
              onClick={() => navigate('/flights')} 
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              View All Routes <ArrowRight size={16} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {[
              { city: 'Dubai', country: 'United Arab Emirates', price: '₹16,500', time: '3h 30m', airline: 'Emirates', code: 'DXB' },
              { city: 'London', country: 'United Kingdom', price: '₹48,000', time: '9h 00m', airline: 'British Airways', code: 'LHR' },
              { city: 'Singapore', country: 'Singapore', price: '₹19,800', time: '4h 30m', airline: 'Singapore Airlines', code: 'SIN' },
              { city: 'Goa', country: 'India (Domestic)', price: '₹3,400', time: '1h 15m', airline: 'IndiGo', code: 'GOI' },
            ].map((dest, i) => (
              <div 
                key={i} 
                className="card" 
                style={{ padding: '24px', cursor: 'pointer', position: 'relative' }}
                onClick={() => {
                  setDestination(dest.city);
                  navigate(`/flights?destination=${dest.city}`);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="badge badge-info">{dest.code}</div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>{dest.time}</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{dest.city}</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>{dest.country}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>From</span>
                    <strong style={{ fontSize: '1.25rem', color: '#2563eb' }}>{dest.price}</strong>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0ea5e9' }}>Book ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section style={{ background: '#ffffff', padding: '60px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '30px'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px' }}>Instant Web Check-In</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Check in online in 30 seconds using your 6-digit PNR and generate boarding passes instantly.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                <Clock size={24} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px' }}>Live Schedule Accuracy</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Automated fleet departures, delays, gate and terminal allocations updated in real-time.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                <Award size={24} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px' }}>SkyHigh Rewards</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Earn 10% reward points on every trip. Redeem miles for seat upgrades and exclusive flights.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
