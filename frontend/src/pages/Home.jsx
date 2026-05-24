import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgVideo from '../assets/home page background/WhatsApp Video 2026-05-24 at 11.31.38 AM.mp4';
import grandImg from '../assets/cinnamon_grand.png';
import lakesideImg from '../assets/cinnamon_lakeside.png';
import wildImg from '../assets/cinnamon_wild.png';

const Home = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect cleanly to rooms search page
    navigate('/rooms');
  };

  return (
    <div className="home-page-container">
      {/* 1. Hero Background Video Section */}
      <div className="home-hero-section">
        <div className="video-background-container">
          <video 
            className="video-background" 
            src={bgVideo} 
            autoPlay 
            loop 
            muted 
            playsInline
          />
          <div className="video-overlay" />
        </div>

        {/* Brand Overlay Title floating in center */}
        <div className="hero-content animate-fade-in" style={{ height: '70%', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '300', letterSpacing: '8px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Luxe.
          </h1>
          <p style={{ fontSize: '1rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#e9d5ff', fontWeight: '600' }}>
            Inspired by Cinnamon Hotels & Resorts
          </p>
        </div>

        {/* Floating Cinnamon-Style Booking Widget */}
        <div className="booking-widget-wrapper">
          <form className="booking-widget" onSubmit={handleSearch}>
            <div className="widget-field">
              <label className="widget-label">Destination / Hotel</label>
              <select 
                className="widget-select"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              >
                <option value="">Select Destination</option>
                <option value="grand">Cinnamon Grand Colombo</option>
                <option value="lakeside">Cinnamon Lakeside Colombo</option>
                <option value="wild">Cinnamon Wild Yala</option>
              </select>
            </div>

            <div className="widget-field">
              <label className="widget-label">Check-In Date</label>
              <input 
                type="date" 
                className="widget-input"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="widget-field">
              <label className="widget-label">Check-Out Date</label>
              <input 
                type="date" 
                className="widget-input"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="widget-field">
              <label className="widget-label">Guests</label>
              <select 
                className="widget-select"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
                <option value="4">4 Adults</option>
              </select>
            </div>

            <button type="submit" className="widget-submit-btn">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 2. Welcome & Brand Story Section */}
      <section className="brand-intro-section">
        <h2 className="brand-story-title">A Journey of Extraordinary Moments</h2>
        <p className="brand-story-text">
          Inspired by Sri Lankan heritage and Cinnamon's warm hospitality, Luxe Hotels & Resorts offers 
          an elite collection of destinations designed to rejuvenate the body, mind, and spirit. From 
          dynamic modern business centers in the city heart of Colombo to rustic luxury safaris on the 
          verge of Yala's untamed wilderness, experience unmatched luxury engineered on a modern 
          microservices cloud architecture.
        </p>
      </section>

      {/* 3. Properties Section */}
      <section className="properties-section">
        <div className="section-header">
          <h2 className="section-title">Explore Our Signature Resorts</h2>
          <span className="section-subtitle">Luxury reimagined in iconic destinations</span>
        </div>

        <div className="home-grid">
          {/* Property 1 */}
          <div className="premium-card">
            <div className="card-image-wrapper">
              <span className="card-tag">City Luxury</span>
              <img src={grandImg} alt="Cinnamon Grand Colombo" className="card-image" />
            </div>
            <div className="card-body">
              <h3 className="card-title">Cinnamon Grand Colombo</h3>
              <p className="card-description">
                An urban oasis located in the heart of Colombo, offering award-winning fine dining, 
                a signature wellness spa, landscaped pool courtyards, and luxury suites tailored for elite travelers.
              </p>
              <div className="card-footer">
                <div className="card-price">
                  Starting Price
                  <span>$180 / night</span>
                </div>
                <span onClick={() => navigate('/rooms')} className="card-link" style={{ cursor: 'pointer' }}>
                  View Rooms →
                </span>
              </div>
            </div>
          </div>

          {/* Property 2 */}
          <div className="premium-card">
            <div className="card-image-wrapper">
              <span className="card-tag">Urban Oasis</span>
              <img src={lakesideImg} alt="Cinnamon Lakeside Colombo" className="card-image" />
            </div>
            <div className="card-body">
              <h3 className="card-title">Cinnamon Lakeside Colombo</h3>
              <p className="card-description">
                Nestled peacefully by the shores of the Beira Lake, this premium resort features tennis courts, 
                luxurious libraries, floating restaurants, and breathtaking sunset views over the water.
              </p>
              <div className="card-footer">
                <div className="card-price">
                  Starting Price
                  <span>$160 / night</span>
                </div>
                <span onClick={() => navigate('/rooms')} className="card-link" style={{ cursor: 'pointer' }}>
                  View Rooms →
                </span>
              </div>
            </div>
          </div>

          {/* Property 3 */}
          <div className="premium-card">
            <div className="card-image-wrapper">
              <span className="card-tag">Wilderness Safari</span>
              <img src={wildImg} alt="Cinnamon Wild Yala" className="card-image" />
            </div>
            <div className="card-body">
              <h3 className="card-title">Cinnamon Wild Yala</h3>
              <p className="card-description">
                Located on the boundary of Yala National Park, get up close to nature in premium rustic chalets 
                where wild elephants roam and leopards live in absolute harmony with local conservationists.
              </p>
              <div className="card-footer">
                <div className="card-price">
                  Starting Price
                  <span>$220 / night</span>
                </div>
                <span onClick={() => navigate('/rooms')} className="card-link" style={{ cursor: 'pointer' }}>
                  View Rooms →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Luxury Brand Footer */}
      <footer className="premium-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">Luxe.</span>
            <p className="footer-brand-text">
              Providing luxury stays and extraordinary travel memories inspired by Sri Lankan hospitality. 
              Built with microservices, styled for absolute comfort.
            </p>
          </div>

          <div>
            <h4 className="footer-column-title">Destinations</h4>
            <ul className="footer-links">
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Colombo</span></li>
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Yala</span></li>
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Kandy</span></li>
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Maldives</span></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Experiences</h4>
            <ul className="footer-links">
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Dining</span></li>
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Wellness Spa</span></li>
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Eco Safaris</span></li>
              <li><span onClick={() => navigate('/rooms')} style={{ cursor: 'pointer' }}>Weddings</span></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Corporate</h4>
            <ul className="footer-links">
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>About Luxe</span></li>
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Careers</span></li>
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Sustainability</span></li>
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Luxe Hotels & Resorts. All Rights Reserved. Inspired by Cinnamon.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Use</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
