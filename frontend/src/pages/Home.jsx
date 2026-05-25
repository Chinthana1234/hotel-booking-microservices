import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgVideo from '../assets/home page background/WhatsApp Video 2026-05-24 at 11.31.38 AM.mp4';
import destMainImg from '../assets/home page background/download (8).jpeg';
import destSubImg from '../assets/destination_sub.png';

import roomImg1 from '../assets/images for rooms/download (2).jpeg';
import roomImg2 from '../assets/images for rooms/download (3).jpeg';
import roomImg3 from '../assets/images for rooms/download (4).jpeg';
import roomImg4 from '../assets/images for rooms/download (5).jpeg';
import roomImg5 from '../assets/images for rooms/images (5).jpeg';
import roomImg6 from '../assets/images for rooms/images (6).jpeg';
import roomImg7 from '../assets/images for rooms/images (7).jpeg';
import roomImg8 from '../assets/images for rooms/images (8).jpeg';
import roomImg9 from '../assets/images for rooms/images (9).jpeg';

const roomImages = [roomImg1, roomImg2, roomImg3, roomImg4, roomImg5, roomImg6, roomImg7, roomImg8, roomImg9];

const Home = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [featuredRooms, setFeaturedRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/rooms');
        const availableRooms = res.data.filter(r => r.isAvailable).slice(0, 3);

        const roomsWithRatings = await Promise.all(availableRooms.map(async (room) => {
          try {
            const reviewRes = await axios.get(`http://localhost:5000/api/reviews/${room._id}`);
            const reviews = reviewRes.data;
            let avgRating = 0;
            if (reviews.length > 0) {
              avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
            }
            return { ...room, avgRating, reviewCount: reviews.length };
          } catch (e) {
            return { ...room, avgRating: 0, reviewCount: 0 };
          }
        }));
        setFeaturedRooms(roomsWithRatings);
      } catch (err) {
        console.error('Failed to load featured rooms', err);
      }
    };
    fetchRooms();
  }, []);

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

        {/* Floating Cinnamon-Style Booking Widget */}
        <div className="booking-widget-wrapper">
          <form className="booking-widget" onSubmit={handleSearch}>
            <div className="widget-field">
              <input type="text" className="widget-input-dummy" value="Select Destination" readOnly />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="widget-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            <div className="widget-field">
              <input type="text" className="widget-input-dummy" value="25 May - 26 May, 2026" readOnly />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="widget-icon"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            <div className="widget-field">
              <input type="text" className="widget-input-dummy" value="01 Room, 02 Adults" readOnly />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="widget-icon"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            <div className="widget-field">
              <input type="text" className="widget-input-dummy promo-input" placeholder="Promo code" readOnly />
            </div>

            <button type="submit" className="widget-submit-btn book-now">
              BOOK NOW
            </button>
          </form>
        </div>
      </div>

      {/* 2. Welcome & Brand Story Section */}
      <section className="brand-intro-section">
        <h2 className="brand-story-title">A Journey of Extraordinary Moments</h2>
        <p className="brand-story-text">
          Inspired by Sri Lankan heritage and Cinnamon's warm hospitality, The Grand Ceylon Hotels & Resorts offers 
          an elite collection of destinations designed to rejuvenate the body, mind, and spirit. From
          dynamic modern business centers in the city heart of Colombo to rustic luxury safaris on the
          verge of Yala's untamed wilderness, experience unmatched luxury engineered on a modern
          microservices cloud architecture.
        </p>
        <button onClick={() => navigate('/rooms')} className="brand-story-btn">
          Explore Rooms & Suites
        </button>
      </section>

      {/* 3. Destination Story Section */}
      <section className="destination-story-section">
        <div className="destination-text-content">
          <h2 className="destination-title">
            WE ARE THE HEART<br/>
            OF EVERY DESTINATION<br/>
            WE LIVE IN
          </h2>
          <p className="destination-description">
            There are many trails and stories surrounding our destination hotels & resorts, and we know them all.
            We celebrate the flavours, way of life, and creativity in each of these destinations across Sri Lanka and the
            Maldives, with love and honesty. This has only been made possible through coexisting with nature and
            working with the communities who've become our neighbours. It has let us become inspiring destinations
            of experience, education, entertainment, and enlightenment. Celebrated in its most authentic way,
            with you.
          </p>
        </div>
        <div className="destination-image-single">
          <img src={destMainImg} alt="Destination Story" className="single-img-main" />
        </div>
      </section>

      {/* 4. Featured Rooms Section */}
      {featuredRooms.length > 0 && (
        <section className="properties-section">
          <div className="section-header">
            <h2 className="section-title">Featured Rooms</h2>
            <span className="section-subtitle">Experience unparalleled comfort</span>
          </div>
          <div className="rooms-grid">
            {featuredRooms.map((room, index) => (
              <div key={room._id} className="room-card glass">
                <div className="room-image-wrapper">
                  <span className={`tag ${room.isAvailable ? 'available' : 'booked'}`} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, margin: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                    {room.isAvailable ? 'Available' : 'Booked'}
                  </span>
                  <img src={roomImages[index % roomImages.length]} alt={`${room.type} Suite`} className="room-card-image" />
                </div>
                <div className="room-card-content">
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '5px', color: '#1e293b' }}>{room.type} Suite - #{room.roomNumber}</h3>
                  {room.reviewCount > 0 ? (
                    <div style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '15px' }}>
                      {'★'.repeat(Math.round(room.avgRating))}
                      {'☆'.repeat(5 - Math.round(room.avgRating))}
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '8px' }}>({room.avgRating.toFixed(1)} from {room.reviewCount} reviews)</span>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>No reviews yet</div>
                  )}
                  <div className="room-price">
                    ${room.pricePerNight} <span>/ night</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '25px', flexGrow: 1 }}>
                    {room.description}
                  </p>
                  <button
                    className="btn"
                    onClick={() => navigate('/rooms')}
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    View All Rooms
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Luxury Brand Footer */}
      <footer className="premium-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">The Grand Ceylon.</span>
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
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>About The Grand Ceylon</span></li>
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Careers</span></li>
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Sustainability</span></li>
              <li><span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} The Grand Ceylon Hotels & Resorts. All Rights Reserved. Inspired by Cinnamon.</span>
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
