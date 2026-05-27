import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingWidgetOpen, setIsBookingWidgetOpen] = useState(false);

  // Functional booking form state
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(tomorrow));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [promoCode, setPromoCode] = useState('');
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const guestPickerRef = useRef(null);
  const widgetRef = useRef(null);

  const isHomePage = location.pathname === '/';

  const destinations = [
    'Colombo', 'Kandy', 'Galle', 'Yala', 'Sigiriya',
    'Nuwara Eliya', 'Bentota', 'Trincomalee', 'Maldives'
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close guest picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (guestPickerRef.current && !guestPickerRef.current.contains(e.target)) {
        setShowGuestPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let isAdmin = false;
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      isAdmin = decoded.isAdmin;
    } catch (e) {
      console.error("Token decoding failed");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setIsBookingWidgetOpen(false);
    setShowGuestPicker(false);
    navigate('/rooms', {
      state: { destination, checkIn, checkOut, rooms, adults, promoCode }
    });
  };

  return (
    <>
      <header className={`navbar-wrapper ${isHomePage ? 'navbar-home' : 'navbar-page'} ${isScrolled ? 'scrolled' : ''}`}>
        {/* Top Purple Bar */}
        <div className="navbar-top">
          <div className="navbar-top-group">
            <Link to="/" className="navbar-top-brand">The Grand Ceylon</Link>
            <span className="navbar-top-divider">|</span>
            <span className="navbar-top-item" style={{ opacity: 0.8 }}>DISCOVERY</span>
          </div>
          
          <div className="navbar-top-group">
            {token && (
              <>
                <Link to="/bookings" className="navbar-top-item">My Bookings</Link>
                <span className="navbar-top-divider">|</span>
              </>
            )}
            
            {isAdmin && (
              <>
                <Link to="/admin" className="navbar-top-item" style={{ color: '#fcd34d' }}>Admin Panel</Link>
                <span className="navbar-top-divider">|</span>
              </>
            )}

            {token ? (
              <span onClick={handleLogout} className="navbar-top-item" style={{ cursor: 'pointer' }}>Logout</span>
            ) : (
              <Link to="/auth" className="navbar-top-item">Sign In</Link>
            )}
            
            <span className="navbar-top-divider">|</span>
            <span className="navbar-top-item" style={{ display: 'inline-flex', alignItems: 'center' }}>
              ENGLISH <span style={{ fontSize: '0.6rem', marginLeft: '4px' }}>▼</span>
            </span>
          </div>
        </div>

        {/* Bottom Main Bar */}
        <div className="navbar-bottom">
          {/* Left: Hamburger menu */}
          <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle Navigation Menu">
            <span className="hamburger-line"></span>
            <span className="hamburger-line" style={{ marginTop: '5px', marginBottom: '5px' }}></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Center: Brand Identity */}
          <div className="brand-center">
            <Link to="/" className="brand-title">The Grand Ceylon</Link>
            <span className="brand-subtitle">Hotels & Resorts</span>
          </div>

          {/* Right: Book Now asymmetric button */}
          <button className="book-now-btn" onClick={() => setIsBookingWidgetOpen(!isBookingWidgetOpen)}>
            Book Now
          </button>
        </div>

        {/* Functional Booking Widget Dropdown */}
        {isBookingWidgetOpen && (
          <div className="navbar-booking-widget-dropdown" ref={widgetRef}>
            <form className="booking-widget" onSubmit={handleBookingSubmit}>
              {/* Destination */}
              <div className="widget-field">
                <select
                  className="widget-input-functional"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  <option value="">Select Destination</option>
                  {destinations.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="widget-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              {/* Check-in Date */}
              <div className="widget-field">
                <div className="widget-date-group">
                  <span className="widget-date-label">Check In</span>
                  <input
                    type="date"
                    className="widget-input-functional widget-date-input"
                    value={checkIn}
                    min={formatDate(new Date())}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        const next = new Date(e.target.value + 'T00:00:00');
                        next.setDate(next.getDate() + 1);
                        setCheckOut(formatDate(next));
                      }
                    }}
                  />
                </div>
                <span className="widget-date-separator">—</span>
                <div className="widget-date-group">
                  <span className="widget-date-label">Check Out</span>
                  <input
                    type="date"
                    className="widget-input-functional widget-date-input"
                    value={checkOut}
                    min={checkIn || formatDate(new Date())}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              {/* Rooms & Guests */}
              <div className="widget-field widget-guest-field" ref={guestPickerRef}>
                <div
                  className="widget-input-functional widget-guest-display"
                  onClick={() => setShowGuestPicker(!showGuestPicker)}
                >
                  {String(rooms).padStart(2, '0')} Room{rooms > 1 ? 's' : ''}, {String(adults).padStart(2, '0')} Adult{adults > 1 ? 's' : ''}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="widget-icon" style={{ cursor: 'pointer' }} onClick={() => setShowGuestPicker(!showGuestPicker)}><polyline points="6 9 12 15 18 9"></polyline></svg>

                {/* Guest Picker Popup */}
                {showGuestPicker && (
                  <div className="widget-guest-picker">
                    <div className="widget-guest-row">
                      <span className="widget-guest-label">Rooms</span>
                      <div className="widget-guest-controls">
                        <button type="button" className="widget-picker-btn" onClick={() => setRooms(Math.max(1, rooms - 1))}>−</button>
                        <span className="widget-picker-value">{rooms}</span>
                        <button type="button" className="widget-picker-btn" onClick={() => setRooms(Math.min(10, rooms + 1))}>+</button>
                      </div>
                    </div>
                    <div className="widget-guest-row">
                      <span className="widget-guest-label">Adults</span>
                      <div className="widget-guest-controls">
                        <button type="button" className="widget-picker-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>−</button>
                        <span className="widget-picker-value">{adults}</span>
                        <button type="button" className="widget-picker-btn" onClick={() => setAdults(Math.min(20, adults + 1))}>+</button>
                      </div>
                    </div>
                    <button type="button" className="widget-guest-done-btn" onClick={() => setShowGuestPicker(false)}>Done</button>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="widget-field">
                <input
                  type="text"
                  className="widget-input-functional"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>

              <button type="submit" className="widget-submit-btn book-now">
                BOOK NOW
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Slide-out Sidebar Drawer */}
      <div className={`menu-drawer-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>
      <div className={`menu-drawer ${isMenuOpen ? 'open' : ''}`}>
        <button className="menu-drawer-close" onClick={closeMenu}>×</button>
        <div className="menu-drawer-links">
          <Link to="/" className="menu-drawer-link" onClick={closeMenu}>Home</Link>
          <Link to="/rooms" className="menu-drawer-link" onClick={closeMenu}>Rooms & Suites</Link>
          {token && <Link to="/bookings" className="menu-drawer-link" onClick={closeMenu}>My Bookings</Link>}
          {isAdmin && <Link to="/admin" className="menu-drawer-link" onClick={closeMenu} style={{ color: '#fcd34d' }}>Admin Panel</Link>}
          
          <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
            {token ? (
              <span className="menu-drawer-link" onClick={handleLogout} style={{ cursor: 'pointer', color: '#f87171' }}>Logout</span>
            ) : (
              <Link to="/auth" className="menu-drawer-link" onClick={closeMenu} style={{ color: '#c084fc' }}>Sign In / Register</Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
