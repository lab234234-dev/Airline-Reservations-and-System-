import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { Plane, Lock, Mail, User, Award, Camera, Trash2, UploadCloud, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [profilePic, setProfilePic] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to downscale and convert image to clean Base64 data URL
  const handleImageSelect = (e) => {
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
        setProfilePic(dataUrl);
        addToast('Photo attached successfully!', 'success');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePic('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    addToast('Photo removed', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await register({ name, email, password, role, profilePic });
      
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      addToast(`Welcome to SkyHigh Air, ${user.name}! 250 bonus miles awarded.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed. Please check your details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '50px 20px', maxWidth: '520px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
        }}>
          <Award size={26} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          Create SkyHigh Account
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
          Join today and instantly claim <strong style={{ color: '#059669' }}>250 Welcome Miles</strong> for your next trip.
        </p>
      </div>

      <div className="card" style={{ padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
        <form onSubmit={handleSubmit}>
          {/* Passenger Photo Upload Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '14px',
            border: '1px dashed #cbd5e1'
          }}>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  background: profilePic ? 'transparent' : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  border: '3px solid #2563eb',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                  transition: 'all 0.2s ease'
                }}
                title="Click to select passenger photo"
              >
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt="Passenger Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Camera size={34} color="#64748b" />
                )}
              </div>

              {/* Little edit camera icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
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
                title="Upload Photo"
              >
                <UploadCloud size={14} />
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                Passenger Photo / ID Picture
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                JPG, PNG, or WEBP (Appears on your boarding pass & profile)
              </div>
            </div>

            {profilePic && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn btn-sm"
                  style={{ 
                    fontSize: '0.78rem', 
                    padding: '4px 10px', 
                    background: '#fee2e2', 
                    color: '#dc2626', 
                    border: '1px solid #fecaca' 
                  }}
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} color="#2563eb" /> Full Name *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Captain Vikram Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={15} color="#2563eb" /> Email Address *
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={15} color="#2563eb" /> Password (Min. 6 chars) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Passenger / Frequent Traveler</option>
              <option value="agent">Airport Counter Agent</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Creating Membership...' : 'Complete Registration ➔'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
