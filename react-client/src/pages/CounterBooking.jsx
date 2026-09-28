import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BoardingPassModal from '../components/BoardingPassModal';
import confetti from 'canvas-confetti';
import { Ticket, Plane, User, Phone, Mail, ShieldCheck, DollarSign, Printer, CheckCircle2 } from 'lucide-react';

export default function CounterBooking() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [selectedFlightId, setSelectedFlightId] = useState('');

  // Counter Passenger Details
  const [passenger, setPassenger] = useState({
    name: '',
    age: 30,
    gender: 'Male',
    idType: 'AADHAAR',
    idNumber: '',
    seatNumber: '3A',
    mealPreference: 'Vegetarian'
  });

  const [contact, setContact] = useState({
    phone: '',
    email: ''
  });

  const [travelClass, setTravelClass] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmed booking for printing pass
  const [issuedBooking, setIssuedBooking] = useState(null);

  useEffect(() => {
    fetchAvailableFlights();
  }, []);

  const fetchAvailableFlights = async () => {
    setLoadingFlights(true);
    try {
      const data = await api.getFlights();
      setFlights(data);
      if (data.length > 0) {
        setSelectedFlightId(data[0]._id || data[0].id);
      }
    } catch (err) {
      addToast(err.message || 'Error loading flights', 'error');
    } finally {
      setLoadingFlights(false);
    }
  };

  const selectedFlight = flights.find(f => (f._id || f.id) == selectedFlightId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFlightId) {
      addToast('Please select a flight', 'error');
      return;
    }

    if (!passenger.name.trim() || !contact.phone.trim()) {
      addToast('Passenger name and contact phone are mandatory', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseFare = selectedFlight.price;
      const payload = {
        travelDetails: {
          flightId: selectedFlightId,
          class: travelClass
        },
        passengers: [passenger],
        contact: contact,
        billing: {
          baseFare: baseFare,
          addOnCharges: 0,
          totalPaid: baseFare,
          paymentStatus: 'COMPLETED',
          paymentMethod: paymentMethod
        }
      };

      const result = await api.bookCounterTicket(payload);

      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch (e) {}

      addToast(`Counter Ticket issued successfully! PNR: ${result.pnr}`, 'success');

      // Prepare boarding pass data
      const passData = {
        pnr: result.pnr,
        airline: selectedFlight.airline,
        flightNumber: selectedFlight.flightNumber,
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        seatNumber: passenger.seatNumber,
        gate: 'B4',
        terminal: 'T2',
        boardingTime: 'Immediate / 45m',
        passengers: [passenger]
      };
      setIssuedBooking(passData);

      // Reset form
      setPassenger({
        name: '',
        age: 30,
        gender: 'Male',
        idType: 'AADHAAR',
        idNumber: '',
        seatNumber: '5B',
        mealPreference: 'Vegetarian'
      });
      setContact({ phone: '', email: '' });

    } catch (err) {
      addToast(err.message || 'Counter booking failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '880px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: 'white',
        padding: '24px 30px',
        borderRadius: '16px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Ticket size={16} /> AIRPORT COUNTER TERMINAL
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0' }}>
            Offline Passenger Ticketing Desk
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Desk Agent: <strong>{user?.name || 'Authorized Staff'}</strong> • Station: STV/BOM Central Desk
          </p>
        </div>

        <div className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          ● TERMINAL ONLINE
        </div>
      </div>

      {/* Main Counter Form */}
      <div className="card" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit}>
          {/* Step 1: Flight Selection */}
          <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <label className="form-label" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              1. Select Departing Flight
            </label>
            {loadingFlights ? (
              <p style={{ color: '#64748b' }}>Loading available flights...</p>
            ) : (
              <select
                className="form-select"
                value={selectedFlightId}
                onChange={(e) => setSelectedFlightId(e.target.value)}
                required
              >
                {flights.map((f) => (
                  <option key={f._id || f.id} value={f._id || f.id}>
                    {f.airline} ({f.flightNumber}) • {f.origin} ➔ {f.destination} • {f.seatsAvailable} Seats Left • ₹{f.price.toLocaleString()}
                  </option>
                ))}
              </select>
            )}

            {selectedFlight && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                background: '#eff6ff',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.88rem',
                color: '#1e40af'
              }}>
                <span>Flight Departure: <strong>{new Date(selectedFlight.departureTime).toLocaleString()}</strong></span>
                <span>Fare: <strong>₹{selectedFlight.price.toLocaleString()}</strong></span>
              </div>
            )}
          </div>

          {/* Step 2: Walk-In Passenger Details */}
          <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <label className="form-label" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              2. Passenger Identity & Seat
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label className="form-label">Passenger Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Patel"
                  value={passenger.name}
                  onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Age *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="form-input"
                  value={passenger.age}
                  onChange={(e) => setPassenger({ ...passenger, age: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={passenger.gender}
                  onChange={(e) => setPassenger({ ...passenger, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label">Government ID Type</label>
                <select
                  className="form-select"
                  value={passenger.idType}
                  onChange={(e) => setPassenger({ ...passenger, idType: e.target.value })}
                >
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="DRIVING_LICENCE">Driving Licence</option>
                </select>
              </div>

              <div>
                <label className="form-label">ID Document Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1234-5678-9012"
                  value={passenger.idNumber}
                  onChange={(e) => setPassenger({ ...passenger, idNumber: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Counter Seat Allocation</label>
                <input
                  type="text"
                  className="form-input"
                  value={passenger.seatNumber}
                  onChange={(e) => setPassenger({ ...passenger, seatNumber: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 3: Passenger Contact & Payment */}
          <div style={{ marginBottom: '28px' }}>
            <label className="form-label" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              3. Contact & Immediate Payment
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">Mobile Phone (for PNR SMS) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="passenger@gmail.com"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="form-label">Class</label>
                <select
                  className="form-select"
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>

              <div>
                <label className="form-label">Counter Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="CASH">Cash Collection</option>
                  <option value="CARD">POS Card Terminal</option>
                  <option value="UPI">Counter QR / UPI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Collected Amount</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>
                ₹{(selectedFlight?.price || 0).toLocaleString()}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{ padding: '12px 32px' }}
            >
              {isSubmitting ? 'Issuing Ticket...' : 'Confirm Payment & Print Pass ➔'}
            </button>
          </div>
        </form>
      </div>

      {/* Boarding pass preview */}
      {issuedBooking && (
        <BoardingPassModal
          booking={issuedBooking}
          onClose={() => setIssuedBooking(null)}
        />
      )}
    </div>
  );
}
