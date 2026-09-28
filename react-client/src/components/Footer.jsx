import React from 'react';
import { Plane, ShieldCheck, Headphones, Award, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#090e17', color: '#94a3b8', paddingTop: '60px', paddingBottom: '30px', marginTop: '80px' }}>
      <div className="container">
        {/* Top Badges Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          paddingBottom: '40px',
          borderBottom: '1px solid #1f2937'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>100% Secure Booking</h4>
              <p style={{ fontSize: '0.8rem' }}>Encrypted payments & instant PNR</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>Frequent Flyer Miles</h4>
              <p style={{ fontSize: '0.8rem' }}>Earn 10% points on every flight</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Headphones size={24} />
            </div>
            <div>
              <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>24/7 Airline Support</h4>
              <p style={{ fontSize: '0.8rem' }}>Toll-free desk +91 1800-SKY-AIR</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          padding: '40px 0',
          borderBottom: '1px solid #1f2937'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px' }}>
              <Plane size={20} color="#38bdf8" />
              <span>SkyHigh Air</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              World-class domestic & international flight reservations. Seamless web check-in, real-time fleet schedules, and airport counter desk management.
            </p>
          </div>

          <div>
            <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Popular Routes</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li>Surat (STV) ➔ Mumbai (BOM)</li>
              <li>Ahmedabad (AMD) ➔ Delhi (DEL)</li>
              <li>Mumbai (BOM) ➔ Dubai (DXB)</li>
              <li>Delhi (DEL) ➔ London Heathrow (LHR)</li>
              <li>Bangalore (BLR) ➔ Singapore (SIN)</li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Quick Portals</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><a href="/about" style={{ color: '#38bdf8', fontWeight: 600 }}>🏢 About SkyHigh Air (Company Profile)</a></li>
              <li><a href="/checkin" style={{ color: '#cbd5e1' }}>Web Check-In & Boarding Pass</a></li>
              <li><a href="/counter-booking" style={{ color: '#cbd5e1' }}>Airport Counter Desk Booking</a></li>
              <li><a href="/login" style={{ color: '#cbd5e1' }}>Sign In to Portal</a></li>
              <li><a href="/dashboard" style={{ color: '#cbd5e1' }}>Passenger Rewards & Profile</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>System Architecture</h5>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8' }}>
              <strong style={{ color: '#38bdf8' }}>Frontend:</strong> React 18, Vite, React Router, Lucide Icons.<br />
              <strong style={{ color: '#a855f7' }}>Backend:</strong> PHP RESTful API (PDO, JWT Security).<br />
              <strong style={{ color: '#4ade80' }}>Database:</strong> MySQL / SQLite Database.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '0.82rem' }}>
          <div>
            © {new Date().getFullYear()} SkyHigh Air Lines Ltd. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Engineered with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>for enterprise aviation operations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
