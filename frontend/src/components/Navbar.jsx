import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

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
          <Link to="/rooms" className="book-now-btn">
            Book Now
          </Link>
        </div>
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
