import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plane, Printer, X, Download, ShieldCheck } from 'lucide-react';

export default function BoardingPassModal({ booking, onClose }) {
  if (!booking) return null;

  const passengers = Array.isArray(booking.passengers) ? booking.passengers : [];
  const primaryPassenger = passengers[0]?.name || (booking.user?.name || 'PASSENGER');
  const pnr = booking.pnr || 'SH-DEMO';
  const flightNum = booking.flightNumber || booking.flight?.flightNumber || 'SH-101';
  const airline = booking.airline || booking.flight?.airline || 'SkyHigh Air';
  const origin = booking.origin || booking.flight?.origin || 'ORIGIN';
  const destination = booking.destination || booking.flight?.destination || 'DEST';
  const seat = booking.seatNumber || passengers[0]?.seatNumber || '12A';
  const gate = booking.gate || 'B4';
  const terminal = booking.terminal || 'T2';
  const boardingTime = booking.boardingTime || '45m Before Departure';

  const handlePrint = () => {
    window.print();
  };

  const qrData = JSON.stringify({
    pnr: pnr,
    flight: flightNum,
    passenger: primaryPassenger,
    seat: seat,
    gate: gate,
    status: 'VERIFIED_BOARDING'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '780px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Action Bar */}
        <div style={{
          padding: '16px 24px',
          background: '#0f172a',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Plane size={18} color="#38bdf8" />
            <span>Official Electronic Boarding Pass</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-sm"
              style={{ background: '#2563eb', color: 'white' }}
            >
              <Printer size={15} /> Print Pass
            </button>
            <button 
              onClick={onClose}
              style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Boarding Pass Ticket Component */}
        <div style={{ padding: '24px', background: '#f8fafc' }}>
          <div className="boarding-pass">
            {/* Main Pass Section */}
            <div className="boarding-pass-main">
              {/* Airline & Status Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plane size={20} style={{ transform: 'rotate(-45deg)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{airline}</h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>FIRST CLASS / PRIORITY BOARDING</span>
                  </div>
                </div>
                <div className="badge badge-success" style={{ gap: '4px', fontSize: '0.75rem' }}>
                  <ShieldCheck size={14} /> READY TO FLY
                </div>
              </div>

              {/* Route */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>FROM</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{origin}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Plane size={22} color="#2563eb" />
                  <div style={{ width: '100px', height: '2px', background: '#cbd5e1', margin: '4px 0' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>FLIGHT {flightNum}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TO</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{destination}</div>
                </div>
              </div>

              {/* Flight Data Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                padding: '16px',
                background: '#f1f5f9',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {(booking.user?.profilePic || booking.user?.profile_pic || passengers[0]?.profilePic) && (
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #2563eb',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}>
                      <img 
                        src={booking.user?.profilePic || booking.user?.profile_pic || passengers[0]?.profilePic} 
                        alt="Passenger" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PASSENGER</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{primaryPassenger}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>GATE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>{gate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TERMINAL</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{terminal}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>SEAT</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>{seat}</div>
                </div>
              </div>

              {/* Additional Passengers */}
              {passengers.length > 1 && (
                <div style={{ marginTop: '14px', fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Additional Passengers: </strong>
                  {passengers.slice(1).map(p => `${p.name} (${p.seatNumber || 'Assigned'})`).join(', ')}
                </div>
              )}
            </div>

            {/* Stub / Tear-off Section with QR code */}
            <div className="boarding-pass-stub">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>BOARDING PASS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{pnr}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{flightNum} • {seat}</div>
              </div>

              {/* QR Code */}
              <div style={{
                background: 'white',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'inline-block'
              }}>
                <QRCodeSVG value={qrData} size={110} level="M" />
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>BOARDING TIME</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#dc2626' }}>{boardingTime}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
