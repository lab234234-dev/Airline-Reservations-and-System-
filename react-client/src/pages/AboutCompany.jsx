import React from 'react';
import { 
  Plane, ShieldCheck, Award, Users, Globe2, Building2, 
  Clock, HeartHandshake, CheckCircle2, Phone, Mail, MapPin, Sparkles, TrendingUp
} from 'lucide-react';

export default function AboutCompany() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #090e17 0%, #0f172a 60%, #1e3a8a 100%)',
        color: 'white',
        padding: '70px 0 90px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#38bdf8',
              marginBottom: '20px'
            }}>
              <Building2 size={16} /> SKYHIGH AIR LINES LIMITED • EST. 2018
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-1px'
            }}>
              Connecting Skies, Elevating Every Journey
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto'
            }}>
              India's premier scheduled commercial carrier providing next-generation passenger aviation, seamless digital reservations, and world-class in-flight hospitality.
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Overview & Fast Facts */}
      <section style={{ padding: '60px 0', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            <div className="card" style={{ padding: '24px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Plane size={24} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>48+</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>Modern Aircraft in Fleet</div>
            </div>

            <div className="card" style={{ padding: '24px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Clock size={24} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>99.4%</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>On-Time Reliability</div>
            </div>

            <div className="card" style={{ padding: '24px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Globe2 size={24} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>18+</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>Domestic & Global Cities</div>
            </div>

            <div className="card" style={{ padding: '24px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Users size={24} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>4.8M+</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748b' }}>Satisfied Travelers / Year</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Profile Story */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '50px',
            alignItems: 'center',
            '@media (max-width: 900px)': { gridTemplateColumns: '1fr' }
          }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '10px' }}>OUR STORY</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '18px' }}>
                Engineering the Future of Commercial Aviation
              </h2>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, marginBottom: '16px' }}>
                Established in 2018, <strong>SkyHigh Air Lines Limited</strong> has emerged as one of India's most dependable and technologically advanced passenger air carriers. We connect commercial capitals like Mumbai, Surat, Ahmedabad, and Delhi with premier tourist corridors and intercontinental hubs including Dubai, Singapore, and London.
              </p>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, marginBottom: '24px' }}>
                Certified under <strong>DGCA AOP (Air Operator Permit)</strong> and audited by the <strong>IATA Operational Safety Audit (IOSA)</strong>, SkyHigh Air operates with a safety-first ethos, fuel-efficient modern airframes, and industry-leading digital passenger tools.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="#16a34a" />
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>100% DGCA & IATA Compliant</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="#16a34a" />
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>Ultra-Low Fuel Burn Fleet</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="#16a34a" />
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>Instant Web QR Check-in</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="#16a34a" />
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>24/7 Airport Counter Services</span>
                </div>
              </div>
            </div>

            {/* Corporate Factsheet Card */}
            <div className="card" style={{ padding: '32px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#2563eb" /> Corporate Identity
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Corporate Entity:</span>
                  <strong style={{ color: '#0f172a' }}>SkyHigh Air Lines Ltd.</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>IATA / ICAO Codes:</span>
                  <strong style={{ color: '#2563eb' }}>SH / SHA (Callsign: SKYHIGH)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Primary Operating Hubs:</span>
                  <strong style={{ color: '#0f172a' }}>BOM (Mumbai) • STV (Surat)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Frequent Flyer Program:</span>
                  <strong style={{ color: '#f59e0b' }}>SkyMiles Loyalty Club</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Safety Rating:</span>
                  <span className="badge badge-success">7-STAR SAFETY INDEX</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Customer Helpline:</span>
                  <strong style={{ color: '#0f172a' }}>+91 1800-SKY-AIR</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Showcase */}
      <section style={{ background: '#ffffff', padding: '70px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
            <span className="badge badge-info" style={{ marginBottom: '8px' }}>THE AIRCRAFT FLEET</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              Precision In Flight: Our Modern Fleet
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              We operate an all-new-generation fleet with an average aircraft age of only 2.8 years, ensuring whisper-quiet cabins, lower emissions, and maximum reliability.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Plane 1: Airbus A320neo */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="badge badge-primary">32 IN FLEET</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>DOMESTIC & REGIONAL</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Airbus A320neo</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
                Equipped with cutting-edge CFM LEAP-1A engines and aerodynamic Sharklets for maximum efficiency and whisper-quiet passenger comfort.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div><span style={{ color: '#94a3b8' }}>Capacity:</span> <strong style={{ display: 'block', color: '#0f172a' }}>180 Seats (3-3)</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Cruising Speed:</span> <strong style={{ display: 'block', color: '#0f172a' }}>840 km/h</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Max Range:</span> <strong style={{ display: 'block', color: '#0f172a' }}>6,300 km</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Service Ceiling:</span> <strong style={{ display: 'block', color: '#0f172a' }}>39,000 ft</strong></div>
              </div>
            </div>

            {/* Plane 2: Boeing 787-9 Dreamliner */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="badge badge-purple">10 IN FLEET</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LONG HAUL GLOBAL</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Boeing 787-9 Dreamliner</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
                Flagship wide-body aircraft deployed on London, Paris, and New York routes featuring electrochromic dimmable windows and higher cabin humidity.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div><span style={{ color: '#94a3b8' }}>Capacity:</span> <strong style={{ display: 'block', color: '#0f172a' }}>296 Seats (3-Class)</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Cruising Speed:</span> <strong style={{ display: 'block', color: '#0f172a' }}>903 km/h</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Max Range:</span> <strong style={{ display: 'block', color: '#0f172a' }}>14,140 km</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Service Ceiling:</span> <strong style={{ display: 'block', color: '#0f172a' }}>43,000 ft</strong></div>
              </div>
            </div>

            {/* Plane 3: Boeing 737 MAX 8 */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="badge badge-success">6 IN FLEET</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>RAPID TRANSIT</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Boeing 737 MAX 8</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
                Aerodynamically optimized winglets and high-bypass turbofans engineered for high-frequency short-haul flights between India's financial hubs.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div><span style={{ color: '#94a3b8' }}>Capacity:</span> <strong style={{ display: 'block', color: '#0f172a' }}>186 Seats</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Cruising Speed:</span> <strong style={{ display: 'block', color: '#0f172a' }}>839 km/h</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Max Range:</span> <strong style={{ display: 'block', color: '#0f172a' }}>6,570 km</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Service Ceiling:</span> <strong style={{ display: 'block', color: '#0f172a' }}>41,000 ft</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & CEO Message */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div className="card" style={{
            padding: '40px',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            color: 'white',
            borderRadius: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '30px',
              alignItems: 'center',
              '@media (max-width: 768px)': { gridTemplateColumns: '1fr' }
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                ✈
              </div>

              <div>
                <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  MESSAGE FROM EXECUTIVE LEADERSHIP
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '6px 0 14px' }}>
                  "Safety is Not a Goal, It is Our Founding Standard"
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '16px' }}>
                  "At SkyHigh Air, every single flight is a testament to the trust our passengers place in us. From our digitally automated web check-in to our real-time seat reservation engine and immaculate fleet maintenance protocols, we are dedicated to setting new benchmarks in aviation technology and passenger care."
                </p>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  <strong style={{ color: 'white' }}>Capt. Vikramaditya Singhania</strong> — Managing Director & Chief Executive Officer
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Headquarters & Contact */}
      <section style={{ padding: '40px 0 70px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <MapPin size={22} color="#2563eb" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Corporate Headquarters</h4>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                SkyHigh Aviation Towers, Level 9<br />
                Chhatrapati Shivaji Maharaj Int'l Airport Zone<br />
                Sahar, Andheri (East), Mumbai 400099, India
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Phone size={22} color="#16a34a" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>24/7 Flight Operations Desk</h4>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Toll-Free (India): <strong>1800-SKY-AIR (1800-759-247)</strong><br />
                International Inquiries: +91 22 6900 8800<br />
                Airport Counter Desk: Counter B4-B8, Terminal 2
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Mail size={22} color="#d97706" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Direct Communications</h4>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Passenger Inquiries: <a href="mailto:support@skyhigh.com" style={{ color: '#2563eb' }}>support@skyhigh.com</a><br />
                Corporate & Fleet Bookings: <a href="mailto:corporate@skyhigh.com" style={{ color: '#2563eb' }}>corporate@skyhigh.com</a><br />
                Investor Relations: <a href="mailto:investor@skyhigh.com" style={{ color: '#2563eb' }}>investor@skyhigh.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
