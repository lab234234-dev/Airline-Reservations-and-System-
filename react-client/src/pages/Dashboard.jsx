import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BoardingPassModal from '../components/BoardingPassModal';
import confetti from 'canvas-confetti';
import { 
  Plane, Calendar, User, Clock, Award, ShieldCheck, Ticket, 
  CheckCircle2, XCircle, Edit3, Save, Building2, Globe2, Sparkles, ExternalLink, ArrowRight, Phone, Mail,
  Camera, Trash2, UploadCloud
} from 'lucide-react';

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const avatarInputRef = useRef(null);
  const bannerAvatarInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'profile' | 'company'
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Selected booking for Boarding Pass Modal
  const [selectedBookingForPass, setSelectedBookingForPass] = useState(null);

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    profilePic: user?.profile_pic || user?.profilePic || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || 'Male',
    idType: user?.id_type || user?.idType || 'Aadhaar',
    idNumber: user?.id_number || user?.idNumber || '',
    seatPreference: user?.seat_preference || user?.seatPreference || 'Window',
    mealPreference: user?.meal_preference || user?.mealPreference || 'Vegetarian'
  });

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        profilePic: user.profile_pic || user.profilePic || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || 'Male',
        idType: user.id_type || user.idType || 'Aadhaar',
        idNumber: user.id_number || user.idNumber || '',
        seatPreference: user.seat_preference || user.seatPreference || 'Window',
        mealPreference: user.meal_preference || user.mealPreference || 'Vegetarian'
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (err) {
      addToast(err.message || 'Error fetching your trips', 'error');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this flight reservation? A full refund will be initiated to your original payment method.')) {
      return;
    }

    try {
      await api.cancelBooking(bookingId);
      addToast('Flight booking cancelled successfully. Refund initiated.', 'info');
      fetchMyBookings();
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  const handlePerformCheckIn = async (bookingId) => {
    try {
      const res = await api.completeCheckIn(bookingId);
      try {
        confetti({ particleCount: 70, spread: 50 });
      } catch (e) {}
      addToast('Web Check-In confirmed! Boarding pass issued.', 'success');
      setSelectedBookingForPass(res.booking);
      fetchMyBookings();
    } catch (err) {
      addToast(err.message || 'Check-in failed', 'error');
    }
  };

  const handleQuickAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image is larger than 5MB. Please choose a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        try {
          await updateProfile({ profilePic: dataUrl });
          setProfileForm(prev => ({ ...prev, profilePic: dataUrl }));
          addToast('Profile picture updated & saved successfully!', 'success');
        } catch (err) {
          addToast(err.message || 'Failed to update profile picture', 'error');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleQuickRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    try {
      await updateProfile({ profilePic: '' });
      setProfileForm(prev => ({ ...prev, profilePic: '' }));
      if (bannerAvatarInputRef.current) bannerAvatarInputRef.current.value = '';
      addToast('Profile picture removed', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to remove photo', 'error');
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image is larger than 5MB. Please choose a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfileForm(prev => ({ ...prev, profilePic: dataUrl }));
        addToast('New photo selected! Click "Save Travel Preferences" to update.', 'info');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfileForm(prev => ({ ...prev, profilePic: '' }));
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    addToast('Photo removed. Click "Save Travel Preferences" to update.', 'info');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setEditingProfile(false);
      addToast('Profile and travel preferences updated!', 'success');
    } catch (err) {
      addToast(err.message || 'Error updating profile', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* Top Banner: Member Profile & Reward Miles */}
      <div className="card" style={{
        padding: '30px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #090e17 0%, #1e293b 100%)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Clickable Avatar with Camera Overlay */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => bannerAvatarInputRef.current?.click()}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  overflow: 'hidden',
                  border: '3px solid #38bdf8',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
                title="Click to upload/change profile picture"
              >
                {(user?.profile_pic || user?.profilePic) ? (
                  <img 
                    src={user.profile_pic || user.profilePic} 
                    alt={user.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>

              <button
                type="button"
                onClick={() => bannerAvatarInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: 'white',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
                title="Upload Profile Picture"
              >
                <Camera size={14} />
              </button>

              <input 
                type="file" 
                ref={bannerAvatarInputRef} 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleQuickAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                  {user?.role?.toUpperCase()} MEMBER
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Verified SkyHigh Account
                </span>
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '2px 0' }}>{user?.name}</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{user?.email} • {user?.phone || 'No phone set'}</p>

              {/* Quick Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => bannerAvatarInputRef.current?.click()}
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Camera size={13} /> {(user?.profile_pic || user?.profilePic) ? 'Change Photo' : 'Upload Profile Photo'}
                </button>

                {(user?.profile_pic || user?.profilePic) && (
                  <button
                    type="button"
                    onClick={handleQuickRemoveAvatar}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Remove Profile Photo"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.12)',
            textAlign: 'right'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Award size={18} /> SkyHigh Frequent Flyer Miles
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', marginTop: '4px' }}>
              {user?.reward_points || user?.rewardPoints || 250}{' '}
              <span style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 600 }}>Pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
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
          <Ticket size={16} /> My Reservations ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'profile' ? '#2563eb' : 'white',
            color: activeTab === 'profile' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            fontWeight: 700
          }}
        >
          <User size={16} /> Traveler Profile & Preferences
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'company' ? '#2563eb' : 'white',
            color: activeTab === 'company' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            fontWeight: 700
          }}
        >
          <Building2 size={16} /> Airline Fleet & Company
        </button>
      </div>

      {/* Tab 1: Bookings List */}
      {activeTab === 'bookings' && (
        <div>
          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 14px'
              }} />
              <p style={{ color: '#64748b' }}>Retrieving your flight itinerary...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Plane size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                No flight reservations found
              </h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>
                Ready to take off? Book your next journey with SkyHigh Air today.
              </p>
              <a href="/flights" className="btn btn-primary">Explore Flights ➔</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {bookings.map((b) => {
                const isCancelled = b.bookingStatus === 'cancelled';
                const isCheckedIn = b.checkInStatus === 'completed' || b.boardingPassIssued;

                return (
                  <div key={b._id || b.id} className="card" style={{ padding: '24px', opacity: isCancelled ? 0.65 : 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.85rem' }}>
                          PNR: {b.pnr}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                          {b.airline || b.flight?.airline} • Flight {b.flightNumber || b.flight?.flightNumber}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isCancelled ? (
                          <span className="badge badge-danger">CANCELLED / REFUNDED</span>
                        ) : isCheckedIn ? (
                          <span className="badge badge-success">CHECKED IN • READY TO FLY</span>
                        ) : (
                          <span className="badge badge-warning">CHECK-IN REQUIRED</span>
                        )}
                      </div>
                    </div>

                    {/* Route Details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '20px',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ROUTE</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                          {b.origin || b.flight?.origin} ➔ {b.destination || b.flight?.destination}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DEPARTURE TIME</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          {b.flight?.departureTime ? new Date(b.flight.departureTime).toLocaleString() : 'Scheduled'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>SEAT & GATE</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb' }}>
                          Seat: {b.seatNumber || 'Assigned'} • Gate: {b.gate || 'B4'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PAID AMOUNT</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                          ₹{b.totalAmount?.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Passengers */}
                    {b.passengers && b.passengers.length > 0 && (
                      <div style={{ marginBottom: '18px', fontSize: '0.85rem', color: '#475569' }}>
                        <strong>Passengers ({b.passengers.length}): </strong>
                        {b.passengers.map(p => `${p.name} (Seat ${p.seatNumber || b.seatNumber})`).join(', ')}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px' }}>
                      {!isCancelled && !isCheckedIn && (
                        <button
                          onClick={() => handlePerformCheckIn(b._id || b.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={15} /> Complete Web Check-In
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          onClick={() => setSelectedBookingForPass(b)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
                        >
                          <Ticket size={15} /> View Boarding Pass
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelBooking(b._id || b.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={15} /> Cancel Reservation
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Travel Preferences */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: '32px', maxWidth: '720px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Traveler Profile
            </h2>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="btn btn-secondary btn-sm"
            >
              <Edit3 size={15} /> {editingProfile ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSaveProfile}>
            {/* Passenger ID Photo Upload / Management Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '28px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => editingProfile && avatarInputRef.current?.click()}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: profileForm.profilePic ? 'transparent' : 'linear-gradient(135deg, #2563eb, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    overflow: 'hidden',
                    border: '3px solid #2563eb',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                    cursor: editingProfile ? 'pointer' : 'default',
                    flexShrink: 0
                  }}
                  title={editingProfile ? 'Click to change photo' : 'Passenger photo'}
                >
                  {profileForm.profilePic ? (
                    <img 
                      src={profileForm.profilePic} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    profileForm.name ? profileForm.name.charAt(0).toUpperCase() : <Camera size={32} />
                  )}
                </div>

                {editingProfile && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: 'white',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                    title="Upload New Photo"
                  >
                    <UploadCloud size={14} />
                  </button>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                    PASSENGER ID PHOTO
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    (Biometric Boarding Pass Photo)
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                  {profileForm.name || 'Passenger Photo'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 10px' }}>
                  {editingProfile 
                    ? 'Upload a clear headshot (JPG, PNG, or WEBP up to 5MB).'
                    : 'This official photo appears on your electronic boarding passes and flight manifests.'}
                </p>

                {editingProfile && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                    >
                      <UploadCloud size={14} /> Choose Photo
                    </button>
                    {profileForm.profilePic && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="btn btn-sm"
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '5px 12px', 
                          background: '#fee2e2', 
                          color: '#dc2626', 
                          border: '1px solid #fecaca' 
                        }}
                      >
                        <Trash2 size={13} /> Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input 
                type="file" 
                ref={avatarInputRef} 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleAvatarSelect}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  disabled={!editingProfile}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={!editingProfile}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Seat Preference</label>
                <select
                  className="form-select"
                  value={profileForm.seatPreference}
                  onChange={(e) => setProfileForm({ ...profileForm, seatPreference: e.target.value })}
                  disabled={!editingProfile}
                >
                  <option value="Window">Window Seat</option>
                  <option value="Aisle">Aisle Seat</option>
                  <option value="Extra Legroom">Extra Legroom</option>
                  <option value="Any">Any Seat</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Meal Preference</label>
                <select
                  className="form-select"
                  value={profileForm.mealPreference}
                  onChange={(e) => setProfileForm({ ...profileForm, mealPreference: e.target.value })}
                  disabled={!editingProfile}
                >
                  <option value="Vegetarian">Vegetarian Meal</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Jain Meal">Jain Meal</option>
                  <option value="Vegan">Vegan</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            {editingProfile && (
              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                <Save size={16} /> Save Travel Preferences
              </button>
            )}
          </form>
        </div>
      )}

      {/* Tab 3: Airline Fleet & Company Overview */}
      {activeTab === 'company' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Company Brand Summary Banner */}
          <div className="card" style={{
            padding: '30px',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            color: 'white',
            borderRadius: '18px'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '8px', fontSize: '0.78rem' }}>
                  OPERATING AIRLINE
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0' }}>
                  SkyHigh Air Lines Limited
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '600px', lineHeight: 1.6 }}>
                  India's premier scheduled passenger carrier adhering to IATA & DGCA civil aviation standards. Providing seamless digital bookings, real-time aircraft seat selection, and 24/7 airport desk services.
                </p>
              </div>

              <div>
                <Link to="/about" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Full Corporate Dossier <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: '#2563eb', fontWeight: 800, fontSize: '1.8rem' }}>48+</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>AIRCRAFT FLEET</div>
              <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Avg. Age: 2.8 Years</span>
            </div>

            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '1.8rem' }}>99.4%</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>ON-TIME PERFORMANCE</div>
              <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Industry Leading</span>
            </div>

            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: '#d97706', fontWeight: 800, fontSize: '1.8rem' }}>180+</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>DAILY DEPARTURES</div>
              <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Metro & Global</span>
            </div>

            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ color: '#7c3aed', fontWeight: 800, fontSize: '1.8rem' }}>7-STAR</div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 700 }}>SAFETY RATING</div>
              <span style={{ fontSize: '0.75rem', color: '#7c3aed' }}>IOSA Certified</span>
            </div>
          </div>

          {/* Fleet Grid & Frequent Flyer Tier */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '24px',
            '@media (max-width: 900px)': { gridTemplateColumns: '1fr' }
          }}>
            {/* Fleet Overview */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plane size={18} color="#2563eb" /> Active Aircraft Types
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Airbus A320neo (32 Aircraft)</strong>
                    <span className="badge badge-primary">DOMESTIC</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0' }}>
                    180 Seats in 3-3 configuration with ergonomic Recaro seating and ultra-efficient CFM LEAP-1A engines.
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Routes: Surat, Mumbai, Ahmedabad, Delhi, Goa, Bangalore</div>
                </div>

                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>Boeing 787-9 Dreamliner (10 Aircraft)</strong>
                    <span className="badge badge-purple">LONG HAUL</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0' }}>
                    296 Seats with lie-flat Business suites and premium entertainment systems for international flights.
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>Routes: Dubai, London Heathrow, New York, Singapore, Paris</div>
                </div>
              </div>
            </div>

            {/* SkyMiles Tier & Member Privileges */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#f59e0b" /> Your SkyMiles Tier Status
              </h3>

              <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>TIER LEVEL</span>
                  <span className="badge badge-warning">SILVER MEMBER</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: '8px 0 2px' }}>
                  {user?.reward_points || user?.rewardPoints || 250} Miles
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Earn 750 more miles to unlock <strong>Gold Tier</strong> (Free Lounge Access & Extra 10kg Baggage).
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                  <CheckCircle2 size={16} />
                  <span>Priority Web Check-in & Instant QR Boarding Pass</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                  <CheckCircle2 size={16} />
                  <span>Complimentary Standard Seat Selection on All Domestic Flights</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                  <CheckCircle2 size={16} />
                  <span>10% Miles Earn Rate on Every Flight Booking</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                <Phone size={14} color="#2563eb" />
                <span>24/7 Priority Support Helpline: <strong>+91 1800-SKY-AIR</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boarding Pass Modal */}
      {selectedBookingForPass && (
        <BoardingPassModal
          booking={selectedBookingForPass}
          onClose={() => setSelectedBookingForPass(null)}
        />
      )}
    </div>
  );
}
