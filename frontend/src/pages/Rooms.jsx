import { useState, useEffect } from 'react';
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

  const handleBook = async (roomId, price) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to book a room!');
      return;
    }

    let userId = 'demo-user';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.id) {
        userId = payload.id;
      }
    } catch (e) {
      console.error('Error decoding token', e);
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // 1. Create Booking (Talks to Booking Service via API Gateway)
      const bookingRes = await axios.post('http://localhost:5000/api/bookings', {
        userId: userId,
        roomId: roomId,
        checkInDate: new Date(),
        checkOutDate: new Date(new Date().getTime() + 86400000), // Next day
        totalPrice: price
      }, config);

      // 2. Process Payment (Talks to Payment Service via API Gateway)
      await axios.post('http://localhost:5000/api/payments', {
        bookingId: bookingRes.data._id,
        userId: userId,
        amount: price,
        paymentMethod: 'Credit Card'
      }, config);

      alert('Booking & Payment Successful!');
      window.location.reload(); // Refresh to show updated availability
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="container" style={{textAlign: 'center', marginTop: '50px'}}>Loading luxury...</div>;
  if (error) return <div className="container" style={{color: '#f87171', textAlign: 'center'}}>{error}</div>;

  return (
    <div className="container animate-fade-in">
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Our Rooms</h2>
      <p style={{ color: 'var(--text-muted)' }}>Find your perfect escape.</p>
      
      <div className="rooms-grid">
        {rooms.length === 0 && <p>No rooms available. Try adding some via the backend!</p>}
        {rooms.map((room, index) => (
          <div key={room._id} className="room-card glass">
            <div className="room-image-wrapper">
              <span className={`tag ${room.isAvailable ? 'available' : 'booked'}`} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, margin: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
                {room.isAvailable ? 'Available' : 'Booked'}
              </span>
              <img src={roomImages[index % roomImages.length]} alt={`${room.type} Suite`} className="room-card-image" />
            </div>
            <div className="room-card-content">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{room.type} Suite - #{room.roomNumber}</h3>
              {room.reviewCount > 0 ? (
                <div style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '15px' }}>
                  {'★'.repeat(Math.round(room.avgRating))}
                  {'☆'.repeat(5 - Math.round(room.avgRating))}
                  <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '8px'}}>({room.avgRating.toFixed(1)} from {room.reviewCount} reviews)</span>
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
                className={`btn ${!room.isAvailable ? 'btn-outline' : ''}`}
                disabled={!room.isAvailable}
                onClick={() => handleBook(room._id, room.pricePerNight)}
                style={{ width: '100%', opacity: !room.isAvailable ? 0.5 : 1, cursor: !room.isAvailable ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
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
