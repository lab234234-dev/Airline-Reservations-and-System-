import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BoardingPassModal from '../components/BoardingPassModal';
import confetti from 'canvas-confetti';
import { Plane, User, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Plus, Trash2, Award } from 'lucide-react';

const SEAT_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SEAT_COLS_LEFT = ['A', 'B', 'C'];
const SEAT_COLS_RIGHT = ['D', 'E', 'F'];

export default function BookTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addRewardPoints } = useAuth();
  const { addToast } = useToast();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Passengers list
  const [passengers, setPassengers] = useState([
    {
      name: user?.name || '',
      age: 28,
      gender: user?.gender || 'Male',
      seatNumber: '4A',
      mealPreference: user?.mealPreference || 'Vegetarian'
    }
  ]);

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit Card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [upiId, setUpiId] = useState('passenger@okaxis');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Booking success modal
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    fetchFlight();
  }, [id]);

  const fetchFlight = async () => {
    setLoading(true);
    try {
      const data = await api.getFlightById(id);
      setFlight(data);
    } catch (err) {
      setError(err.message || 'Flight details not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      addToast('Maximum 6 passengers allowed per booking', 'warning');
      return;
    }
    setPassengers([
      ...passengers,
      {
        name: '',
        age: 25,
        gender: 'Female',
        seatNumber: '',
        mealPreference: 'Vegetarian'
      }
    ]);
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length === 1) {
      addToast('At least one passenger is required', 'warning');
      return;
    }
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSeatClick = (seatCode) => {
    const booked = flight?.bookedSeats || [];
    if (booked.includes(seatCode)) {
      addToast(`Seat ${seatCode} is already occupied!`, 'warning');
      return;
    }

    // Assign seat to first passenger without a seat, or update current passenger
    const unassignedIdx = passengers.findIndex(p => !p.seatNumber);
    if (unassignedIdx !== -1) {
      handlePassengerChange(unassignedIdx, 'seatNumber', seatCode);
      addToast(`Assigned Seat ${seatCode} to Passenger #${unassignedIdx + 1}`, 'info');
    } else {
      // Overwrite passenger 1's seat
      handlePassengerChange(0, 'seatNumber', seatCode);
      addToast(`Updated Passenger #1 Seat to ${seatCode}`, 'info');
    }
  };

  const handleInitiatePayment = (e) => {
    e.preventDefault();

    // Validate passenger details
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        addToast(`Please enter the name for Passenger #${i + 1}`, 'error');
        return;
      }
      if (!passengers[i].seatNumber) {
        addToast(`Please select a seat for Passenger #${i + 1}`, 'error');
        return;
      }
    }

    if (!user) {
      addToast('Please login to complete your booking', 'info');
      navigate('/login');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmBookingAndPay = async () => {
    setProcessingPayment(true);
    try {
      const baseFare = flight.price * passengers.length;
      const taxes = Math.round(baseFare * 0.12);
      const totalAmount = baseFare + taxes;

      const payload = {
        flightId: flight._id || flight.id,
        passengers: passengers,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: 'paid'
      };

      const result = await api.bookTicket(payload);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      addRewardPoints(Math.floor(totalAmount * 0.1));
      addToast('Flight ticket booked and confirmed successfully!', 'success');
      setShowPaymentModal(false);
      setConfirmedBooking(result.booking || payload);

    } catch (err) {
      addToast(err.message || 'Payment or booking failed', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading flight details & seat layout...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
        <h2>Flight Not Found</h2>
        <p style={{ color: '#64748b', margin: '8px 0 20px' }}>{error || 'Unable to locate flight details.'}</p>
        <button onClick={() => navigate('/flights')} className="btn btn-primary">
          Back to Flights
        </button>
      </div>
    );
  }

  const baseFare = flight.price * passengers.length;
  const taxes = Math.round(baseFare * 0.12);
  const totalAmount = baseFare + taxes;
  const selectedSeats = passengers.map(p => p.seatNumber).filter(Boolean);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Flight Summary Top Header */}
      <div className="card" style={{ padding: '24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <span className="badge badge-primary">{flight.airline} • {flight.flightNumber}</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
              {flight.origin} ➔ {flight.destination}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Departure: <strong>{new Date(flight.departureTime).toLocaleString()}</strong> • Arrival: <strong>{new Date(flight.arrivalTime).toLocaleString()}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Base Fare per Passenger</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>
              ₹{flight.price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Passengers Form + Interactive Seat Map + Fare Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '30px',
        alignItems: 'start',
        '@media (max-width: 900px)': { gridTemplateColumns: '1fr' }
      }}>
        {/* Left: Passenger Details Forms */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Passenger Information ({passengers.length})
            </h2>
            <button
              type="button"
              onClick={handleAddPassenger}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Passenger
            </button>
          </div>

          <form onSubmit={handleInitiatePayment}>
            {passengers.map((p, idx) => (
              <div key={idx} className="card" style={{ padding: '20px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#2563eb' }}>
                    <User size={18} />
                    <span>Passenger #{idx + 1}</span>
                  </div>

                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePassenger(idx)}
                      className="btn btn-danger btn-sm"
                      title="Remove Passenger"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      value={p.name}
                      onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Age *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-input"
                      value={p.age}
                      onChange={(e) => handlePassengerChange(idx, 'age', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={p.gender}
                      onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Assigned Seat *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Click on seat map"
                      value={p.seatNumber}
                      onChange={(e) => handlePassengerChange(idx, 'seatNumber', e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">In-Flight Meal</label>
                    <select
                      className="form-select"
                      value={p.mealPreference}
                      onChange={(e) => handlePassengerChange(idx, 'mealPreference', e.target.value)}
                    >
                      <option value="Vegetarian">Vegetarian Meal</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Jain Meal">Jain Meal</option>
                      <option value="Vegan">Vegan</option>
                      <option value="None">No Meal</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '10px' }}>
              Proceed to Payment (₹{totalAmount.toLocaleString()}) ➔
            </button>
          </form>
        </div>

        {/* Right: Interactive Seat Map & Price Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Seat Map Picker */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Select Seats</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Airbus A320 (3-3 Layout)</span>
            </div>

            {/* Seat Map Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '18px', fontSize: '0.78rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'white', border: '1px solid #cbd5e1' }} />
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--primary)' }} />
                <span>Selected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#e2e8f0' }} />
                <span>Occupied</span>
              </div>
            </div>

            {/* Aircraft Nose Indicator */}
            <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              ▲ FRONT OF AIRCRAFT (COCKPIT) ▲
            </div>

            {/* Seat Grid */}
            <div className="seat-map-grid">
              {SEAT_ROWS.map((row) => (
                <div key={row} className="seat-row">
                  {/* Left cols: A, B, C */}
                  {SEAT_COLS_LEFT.map((col) => {
                    const seatCode = `${row}${col}`;
                    const isBooked = flight.bookedSeats?.includes(seatCode);
                    const isSelected = selectedSeats.includes(seatCode);

                    return (
                      <button
                        key={seatCode}
                        type="button"
                        onClick={() => handleSeatClick(seatCode)}
                        className={`seat-item ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        title={seatCode}
                        disabled={isBooked}
                      >
                        {col}
                      </button>
                    );
                  })}

                  {/* Aisle Number */}
                  <div className="seat-aisle">{row}</div>

                  {/* Right cols: D, E, F */}
                  {SEAT_COLS_RIGHT.map((col) => {
                    const seatCode = `${row}${col}`;
                    const isBooked = flight.bookedSeats?.includes(seatCode);
                    const isSelected = selectedSeats.includes(seatCode);

                    return (
                      <button
                        key={seatCode}
                        type="button"
                        onClick={() => handleSeatClick(seatCode)}
                        className={`seat-item ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        title={seatCode}
                        disabled={isBooked}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Fare Summary Box */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Price Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Base Fare ({passengers.length} × ₹{flight.price.toLocaleString()})</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{baseFare.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Aviation Fuel & Airport Taxes (12%)</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{taxes.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Complimentary Seat Selection</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '14px',
                marginTop: '10px',
                borderTop: '2px dashed #e2e8f0',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a'
              }}>
                <span>Total Amount:</span>
                <span style={{ color: '#2563eb' }}>₹{totalAmount.toLocaleString()}</span>
              </div>

              {/* Reward Points Earning Note */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fef3c7',
                color: '#92400e',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginTop: '12px'
              }}>
                <Award size={16} />
                <span>You will earn +{Math.floor(totalAmount * 0.1)} frequent flyer miles!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.2rem' }}>
                <CreditCard size={22} color="#2563eb" />
                <span>SkyHigh Secure Checkout</span>
              </div>
              <button onClick={() => setShowPaymentModal(false)} style={{ color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Payable Amount</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>₹{totalAmount.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Flight: {flight.flightNumber} ({flight.origin} ➔ {flight.destination})</div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Credit/Debit Card', 'UPI', 'Net Banking'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      background: paymentMethod === mode ? '#eff6ff' : '#f8fafc',
                      color: paymentMethod === mode ? '#2563eb' : '#64748b',
                      border: paymentMethod === mode ? '1.5px solid #2563eb' : '1px solid #e2e8f0'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'Credit/Debit Card' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry</label>
                    <input type="text" className="form-input" defaultValue="11/29" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="password" className="form-input" defaultValue="782" maxLength={3} />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="form-group">
                <label className="form-label">UPI Virtual ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                />
              </div>
            )}

            <button
              onClick={handleConfirmBookingAndPay}
              disabled={processingPayment}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '16px' }}
            >
              {processingPayment ? 'Authorizing Payment...' : `Authorize & Pay ₹${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </div>
      )}

      {/* Confirmed Booking Boarding Pass Modal */}
      {confirmedBooking && (
        <BoardingPassModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}
