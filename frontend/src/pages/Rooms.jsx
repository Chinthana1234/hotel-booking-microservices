import { useState, useEffect } from 'react';
import axios from 'axios';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Notice we are communicating ONLY with the API Gateway on port 5000!
        const res = await axios.get('http://localhost:5000/api/rooms');
        setRooms(res.data);
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
        {rooms.map((room) => (
          <div key={room._id} className="room-card glass">
            <span className={`tag ${room.isAvailable ? 'available' : 'booked'}`}>
              {room.isAvailable ? 'Available' : 'Booked'}
            </span>
            <h3 style={{ fontSize: '1.5rem' }}>{room.type} Suite - #{room.roomNumber}</h3>
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
              style={{ width: '100%', opacity: !room.isAvailable ? 0.5 : 1, cursor: !room.isAvailable ? 'not-allowed' : 'pointer' }}
            >
              {room.isAvailable ? 'Book Now' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;
