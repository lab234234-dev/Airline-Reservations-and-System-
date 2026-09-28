import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import BoardingPassModal from '../components/BoardingPassModal';
import confetti from 'canvas-confetti';
import { CheckCircle2, Search, Plane, ShieldCheck, Ticket, AlertCircle } from 'lucide-react';

export default function Checkin() {
  const { addToast } = useToast();
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) {
      addToast('Please enter your 6-digit PNR', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.completeCheckInByPnr(pnr.trim().toUpperCase());
      setBooking(res.booking);

      try {
        confetti({
          particleCount: 90,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      addToast('Web Check-In successful! Boarding pass issued.', 'success');
    } catch (err) {
      addToast(err.message || 'Check-in failed. Please verify your PNR number.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <CheckCircle2 size={32} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Official Web Check-In
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          Check-in online 48 hours to 60 minutes before departure. Retrieve your booking and generate your boarding pass instantly.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="card" style={{ padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
        <form onSubmit={handleCheckIn}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Booking Reference / PNR *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SH-DEMO1 or SK8F"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Found on your booking confirmation email/SMS
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Passenger Last Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Traveler"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Used for secondary identity confirmation
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'Verifying Flight Manifest...' : (
              <>
                <Search size={18} /> Retrieve Booking & Issue Boarding Pass
              </>
            )}
          </button>
        </form>

      </div>

      {/* Guidelines Box */}
      <div style={{
        marginTop: '32px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div>
            <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Baggage Drop</h5>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Drop checked luggage at counter desk up to 45 mins prior to departure.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Plane size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div>
            <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Boarding Gate</h5>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Boarding gates close strictly 25 minutes prior to scheduled takeoff.</p>
          </div>
        </div>
      </div>

      {/* Modal for Boarding Pass */}
      {booking && (
        <BoardingPassModal
          booking={booking}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}
