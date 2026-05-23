import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookingsAndRooms = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view your bookings.');
        setLoading(false);
        return;
      }

      let userId = '';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.id) {
          userId = payload.id;
        }
      } catch (e) {
        setError('Invalid session. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch user bookings
        const bookingsRes = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 2. Fetch all rooms to map details
        const roomsRes = await axios.get('http://localhost:5000/api/rooms');
        
        // Convert rooms array into an easy-lookup dictionary: { roomId: roomObj }
        const roomsMap = {};
        roomsRes.data.forEach(room => {
          roomsMap[room._id] = room;
        });

        setBookings(bookingsRes.data);
        setRooms(roomsMap);
      } catch (err) {
        setError('Failed to fetch bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsAndRooms();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Booking cancelled successfully!');
      
      // Update UI state locally
      setBookings(prevBookings => 
        prevBookings.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="container" style={{textAlign: 'center', marginTop: '50px'}}>Loading your reservations...</div>;
  if (error) return <div className="container" style={{color: '#f87171', textAlign: 'center'}}>{error}</div>;

  return (
    <div className="container animate-fade-in">
      <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>My Bookings</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Manage your luxury stays and reservations.</p>

      {bookings.length === 0 ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '20px' }}>You don't have any bookings yet.</p>
          <Link to="/rooms" className="btn">Book a Room Now</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((booking) => {
            const room = rooms[booking.roomId] || {
              type: 'Unknown Room',
              roomNumber: 'N/A',
              description: 'Room details could not be loaded.'
            };

            const isCancelled = booking.status === 'Cancelled';

            return (
              <div key={booking._id} className="glass" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '25px 30px', borderRadius: '16px', gap: '20px' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <span className={`tag ${isCancelled ? 'booked' : 'available'}`} style={{ marginBottom: '10px' }}>
                    {booking.status}
                  </span>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>
                    {room.type} Suite - #{room.roomNumber}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    {room.description}
                  </p>
                </div>

                <div style={{ flex: '1 1 200px', display: 'flex', gap: '30px', fontSize: '0.95rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Check In</div>
                    <div style={{ fontWeight: '500' }}>{formatDate(booking.checkInDate)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Check Out</div>
                    <div style={{ fontWeight: '500' }}>{formatDate(booking.checkOutDate)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '150px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                    ${booking.totalPrice}
                  </div>
                  {!isCancelled && (
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleCancel(booking._id)}
                      style={{ fontSize: '0.9rem', padding: '8px 20px', borderColor: '#ef4444', color: '#f87171' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
