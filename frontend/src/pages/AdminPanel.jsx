import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Standard',
    pricePerNight: '',
    description: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }

    // Check if admin
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (!decoded.isAdmin) {
        navigate('/');
      }
    } catch (e) {
      navigate('/auth');
    }

    fetchRooms();
  }, [navigate, token]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/rooms', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ roomNumber: '', type: 'Standard', pricePerNight: '', description: '' });
      fetchRooms(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Admin Panel...</div>;
  if (error) return <div className="error" style={{ textAlign: 'center', marginTop: '4rem', color: '#ff4d4f' }}>{error}</div>;

  return (
    <div className="container" style={{ paddingTop: '100px' }}>
      <h1 className="title">Admin <span className="highlight">Panel</span></h1>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

        <div className="admin-form glass-card" style={{ padding: '2rem' }}>
          <h2>Add New Room</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label>Room Number</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              />
            </div>
            <div>
              <label>Room Type</label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </select>
            </div>
            <div>
              <label>Price Per Night ($)</label>
              <input
                type="number"
                required
                className="input-field"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                required
                className="input-field"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Add Room</button>
          </form>
        </div>

        <div className="admin-list glass-card" style={{ padding: '2rem' }}>
          <h2>Manage Rooms</h2>
          <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <th style={{ padding: '1rem' }}>Room #</th>
                  <th style={{ padding: '1rem' }}>Type</th>
                  <th style={{ padding: '1rem' }}>Price</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '1rem' }}>{room.roomNumber}</td>
                    <td style={{ padding: '1rem' }}>{room.type}</td>
                    <td style={{ padding: '1rem' }}>${room.pricePerNight}</td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleDelete(room._id)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: '#ff4d4f', color: '#ff4d4f' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No rooms found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
