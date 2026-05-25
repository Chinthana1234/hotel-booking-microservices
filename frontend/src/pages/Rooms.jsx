import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Notice we are communicating ONLY with the API Gateway on port 5000!
        const res = await axios.get('http://localhost:5000/api/rooms');

        // Fetch reviews for each room to calculate average rating
        const roomsWithRatings = await Promise.all(res.data.map(async (room) => {
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

        setRooms(roomsWithRatings);
      } catch (err) {
        setError('Failed to load rooms. Make sure the API Gateway & Room Service are running!');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleBook = (room) => {
    navigate('/checkout', { state: { room } });
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading luxury...</div>;
  if (error) return <div className="container" style={{ color: '#f87171', textAlign: 'center' }}>{error}</div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Our Rooms</h2>
      <p style={{ color: 'var(--text-muted)' }}>Find your perfect escape.</p>

      <div className="rooms-list-container">
        {rooms.length === 0 && <p>No rooms available. Try adding some via the backend!</p>}
        {rooms.map((room, index) => (
          <div key={room._id} className="room-list-card">
            
            {/* Left Column: Image & Amenities */}
            <div className="room-list-left">
              <div className="room-list-image-container">
                <img src={roomImages[index % roomImages.length]} alt={`${room.type} Suite`} className="room-list-image" />
                <div className="gallery-icon-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                </div>
              </div>
              <div className="room-list-amenities">
                <div className="amenity-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 2v20M15 5H8a3.5 3.5 0 0 0 0 7h6a3.5 3.5 0 0 1 0 7H8"/></svg>
                  Air Conditioning
                </div>
                <div className="amenity-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h8M12 2v4M12 18v4M6 12H2M22 12h-4"/></svg>
                  Separate Shower
                </div>
                <div className="amenity-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                  Hair Dryer
                </div>
              </div>
            </div>

            {/* Middle Column: Details & Promo */}
            <div className="room-list-mid">
              <h3 className="room-list-title">{room.type.toUpperCase()}</h3>
              
              <div className="room-status-bar">
                <span className={`room-urgency ${room.isAvailable ? 'red-text' : 'gray-text'}`}>
                  {room.isAvailable ? 'Only 1 room left' : 'Booked out'}
                </span>
                <span className="room-meta">1 King bed &bull; Sleeps 3</span>
              </div>
              
              <div className="room-details-link">Room Details</div>
              
              <div className="room-promo-divider"></div>

              <div className="room-promo-section">
                <div className="promo-title">Room Only - The Grand Ceylon DISCOVERY - The Grand Ceylon Discovery Member</div>
                <div className="promo-highlight">Earn 2X DISCOVERY Dollars with The Grand Ceylon DISCOVERY Island Rewards until 31st May 2026.</div>
                <div className="promo-list">
                  15% off Dining<br/>
                  10% off Spa Indulgences
                </div>
                <div className="promo-extra">
                  Enjoy your exclusive nature stay with:<br/>
                  2X DISCOVERY Dollars until 31 Oct 2026<br/>
                  &bull; 15% savings on dining<br/>
                  &bull; 10% savings on spa indulgences<br/>
                  &bull; Member exclusive benefits
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Booking */}
            <div className="room-list-right">
              <div className="member-rate-label">MEMBER RATE</div>
              <div className="price-block">
                <span className="old-price">${room.pricePerNight + 50}</span>
                <span className="new-price">${room.pricePerNight}</span>
              </div>
              <div className="price-meta">
                Per Night<br/>
                Excluding taxes and fees
              </div>
              <button
                className={`book-now-list-btn ${!room.isAvailable ? 'disabled' : ''}`}
                disabled={!room.isAvailable}
                onClick={() => handleBook(room)}
              >
                {room.isAvailable ? 'Book Now' : 'Unavailable'}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
