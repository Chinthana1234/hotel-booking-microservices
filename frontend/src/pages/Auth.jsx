import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/login,register/lucid-origin_Cinematic_drone_shot_slowly_gliding_over_a_luxury_tropical_resort_in_the_Maldive-0.jpg';

const styleSheet = `
  .auth-page-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: #ffffff;
    font-family: 'Outfit', sans-serif;
    overflow-x: hidden;
  }

  .auth-form-side {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 50px 80px;
    background-color: #ffffff;
  }

  .auth-image-side {
    width: 50%;
    position: relative;
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 40px;
  }

  .auth-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(44, 30, 20, 0.2) 0%, rgba(15, 23, 42, 0.65) 100%);
    z-index: 1;
  }

  .auth-image-content {
    position: relative;
    z-index: 2;
    max-width: 520px;
  }

  .auth-brand {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.4rem;
    font-weight: 500;
    color: #0f172a;
    align-self: flex-start;
    margin-bottom: auto;
    letter-spacing: 0.5px;
  }

  .auth-form-wrapper {
    width: 100%;
    max-width: 390px;
    margin: auto 0;
  }

  .auth-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2.2rem;
    font-weight: 500;
    color: #000000;
    margin-bottom: 8px;
    text-align: left;
    letter-spacing: -0.5px;
  }

  .auth-subtitle {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 35px;
    text-align: left;
    font-weight: 400;
    line-height: 1.5;
  }

  .auth-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .auth-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .auth-forgot {
    font-size: 0.72rem;
    color: #64748b;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;
  }

  .auth-forgot:hover {
    color: #db2777;
  }

  .auth-input-wrapper {
    display: flex;
    align-items: center;
    background-color: #eff6ff;
    border: 1.5px solid transparent;
    border-radius: 8px;
    padding: 0 16px;
    margin-bottom: 20px;
    transition: all 0.25s ease;
  }

  .auth-input-wrapper.focused {
    background-color: #ffffff;
    border-color: #db2777;
    box-shadow: 0 0 0 3px rgba(219, 39, 119, 0.15);
  }

  .auth-input-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
  }

  .auth-input {
    background: transparent;
    border: none;
    outline: none;
    padding: 14px 12px;
    width: 100%;
    font-size: 0.95rem;
    color: #0f172a;
    font-family: 'Outfit', sans-serif;
  }

  .auth-input::placeholder {
    color: #94a3b8;
  }

  .auth-submit-btn {
    background-color: #000000;
    color: #ffffff;
    width: 100%;
    border: none;
    border-radius: 8px;
    padding: 14px;
    font-weight: 600;
    font-size: 0.85rem;
    letter-spacing: 2px;
    cursor: pointer;
    margin-top: 8px;
    text-transform: uppercase;
    transition: all 0.25s ease;
  }

  .auth-submit-btn:hover {
    background-color: #db2777;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(219, 39, 119, 0.25);
  }

  .auth-separator {
    display: flex;
    align-items: center;
    margin: 25px 0;
    color: #94a3b8;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 1.5px;
  }

  .auth-separator-line {
    flex-grow: 1;
    height: 1px;
    background-color: #e2e8f0;
  }

  .auth-separator-text {
    padding: 0 15px;
    text-transform: uppercase;
  }

  .auth-google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    background-color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Outfit', sans-serif;
  }

  .auth-google-btn:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
  }

  .auth-google-text {
    font-size: 0.85rem;
    color: #334155;
    font-weight: 500;
    margin-left: 10px;
  }

  .auth-footer {
    margin-top: 35px;
    font-size: 0.82rem;
    color: #475569;
    text-align: center;
  }

  .auth-footer-link {
    font-weight: 600;
    color: #000000;
    cursor: pointer;
    margin-left: 4px;
    transition: color 0.2s;
  }

  .auth-footer-link:hover {
    color: #db2777;
  }

  .auth-right-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2.8rem;
    font-weight: 400;
    color: #ffffff;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin: 0 0 10px 0;
  }

  .auth-right-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 15px 0;
    gap: 15px;
  }

  .auth-right-line {
    width: 40px;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.4);
  }

  .auth-right-bullet {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
  }

  .auth-right-sub {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-size: 1.15rem;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 300;
    margin: 0;
    letter-spacing: 0.5px;
  }

  @media (max-width: 968px) {
    .auth-page-container {
      flex-direction: column;
    }

    .auth-form-side {
      width: 100%;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .auth-image-side {
      display: none;
    }

    .auth-brand {
      margin-bottom: 40px;
      align-self: center;
    }
  }
`;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      localStorage.setItem('token', res.data.token);
      navigate('/rooms');
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth-page-container">
      <style>{styleSheet}</style>

      {/* Left side Form */}
      <div className="auth-form-side">
        <div className="auth-brand">The Grand Ceylon</div>

        <div className="auth-form-wrapper">
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Please enter your details to sign in to your account.' 
              : 'Please enter your details to register.'
            }
          </p>

          <form onSubmit={handleSubmit}>
            {/* Full Name field (Register only) */}
            {!isLogin && (
              <div>
                <label className="auth-label">Full Name</label>
                <div className={`auth-input-wrapper ${focusedField === 'name' ? 'focused' : ''}`}>
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="auth-label">Email Address</label>
              <div className={`auth-input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="auth-label-row">
                <label className="auth-label">Password</label>
                {isLogin && <span className="auth-forgot">Forgot Password?</span>}
              </div>
              <div className={`auth-input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              {isLogin ? 'Sign In' : 'Register'}
            </button>
          </form>

          <div className="auth-separator">
            <div className="auth-separator-line"></div>
            <span className="auth-separator-text">or continue with</span>
            <div className="auth-separator-line"></div>
          </div>

          <button className="auth-google-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="auth-google-text">Sign in with Google</span>
          </button>

          <p className="auth-footer">
            {isLogin ? "New to The Grand Ceylon? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="auth-footer-link"
            >
              {isLogin ? 'Create an account' : 'Sign In'}
            </span>
          </p>
        </div>

        {/* Small copyright at bottom */}
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 'auto', paddingTop: '20px' }}>
          &copy; {new Date().getFullYear()} The Grand Ceylon. All rights reserved.
        </div>
      </div>

      {/* Right side cinematic image */}
      <div className="auth-image-side" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <h1 className="auth-right-title">The Grand Ceylon</h1>
          <div className="auth-right-divider">
            <div className="auth-right-line"></div>
            <span className="auth-right-bullet">✦</span>
            <div className="auth-right-line"></div>
          </div>
          <p className="auth-right-sub">“Crafted by nature, perfected by luxury.”</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
