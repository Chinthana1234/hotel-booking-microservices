import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Rooms State
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'Standard',
    pricePerNight: '',
    description: ''
  });

  // Analytics Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

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
        return;
      }
    } catch (e) {
      navigate('/auth');
      return;
    }

    // Load initial data based on active tab
    if (activeTab === 'analytics') {
      fetchStats();
    } else if (activeTab === 'rooms') {
      fetchRooms();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [navigate, token, activeTab]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
      setStatsError(null);
    } catch (err) {
      setStatsError(err.response?.data?.detail || 'Failed to fetch analytics statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRooms = async () => {
    setRoomsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
      setRoomsError(null);
    } catch (err) {
      setRoomsError(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
      setBookingsError(null);
    } catch (err) {
      setBookingsError(err.response?.data?.detail || 'Failed to fetch bookings list');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setUsersError(null);
    } catch (err) {
      setUsersError(err.response?.data?.detail || 'Failed to fetch users list');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoomDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleRoomCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/rooms', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ roomNumber: '', type: 'Standard', pricePerNight: '', description: '' });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleBookingCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const handleUserPromote = async (userId) => {
    if (!window.confirm('Are you sure you want to promote this user to Admin?')) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to promote user');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '120px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
        Admin <span className="highlight" style={{ color: 'var(--primary)' }}>Control Center</span>
      </h1>

      {/* Navigation Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '30px' }}>
        {['analytics', 'rooms', 'bookings', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn"
            style={{
              background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab ? '#ffffff' : '#94a3b8',
              border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.1)',
              padding: '10px 24px',
              borderRadius: '8px',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '1px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      
      {/* 1. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div>
          {statsLoading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '50px' }}>Loading analytics dashboard...</div>
          ) : statsError ? (
            <div style={{ color: '#f87171', padding: '20px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{statsError}</div>
          ) : stats && (
            <div>
              {/* Stats Summary Cards Grid */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                
                <div className="stat-card glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</span>
                  <h3 style={{ fontSize: '2.2rem', marginTop: '10px', fontWeight: '700', color: '#22c55e' }}>${stats.totalRevenue?.toLocaleString()}</h3>
                </div>

                <div className="stat-card glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Occupancy Rate</span>
                  <h3 style={{ fontSize: '2.2rem', marginTop: '10px', fontWeight: '700', color: 'var(--primary)' }}>{stats.occupancyRate}%</h3>
                </div>

                <div className="stat-card glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Bookings</span>
                  <h3 style={{ fontSize: '2.2rem', marginTop: '10px', fontWeight: '700' }}>{stats.totalBookings}</h3>
                </div>

                <div className="stat-card glass" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Customers</span>
                  <h3 style={{ fontSize: '2.2rem', marginTop: '10px', fontWeight: '700' }}>{stats.totalUsers}</h3>
                </div>

              </div>

              {/* Recent Bookings and Payments side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
                
                {/* Recent Bookings */}
                <div className="glass-card" style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: '400' }}>Recent Booking Activity</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '10px 0', color: '#94a3b8' }}>Room</th>
                          <th style={{ padding: '10px 0', color: '#94a3b8' }}>Dates</th>
                          <th style={{ padding: '10px 0', color: '#94a3b8' }}>Total</th>
                          <th style={{ padding: '10px 0', color: '#94a3b8' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentBookings?.map(b => (
                          <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 0' }}>#{b.roomId ? "Suite" : "Standard"}</td>
                            <td style={{ padding: '12px 0' }}>{new Date(b.checkInDate).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 0' }}>${b.totalPrice}</td>
                            <td style={{ padding: '12px 0' }}>
                              <span style={{
                                color: b.status === 'Cancelled' ? '#f87171' : '#4ade80',
                                background: b.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.8rem'
                              }}>{b.status}</span>
                            </td>
                          </tr>
                        ))}
                        {stats.recentBookings?.length === 0 && (
                          <tr><td colSpan="4" style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8' }}>No bookings found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Payments */}
                <div className="glass-card" style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', fontWeight: '400' }}>Recent Financial Transactions</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '10px 0', color: '#94a3b8' }}>Method</th>
                          <th style={{ padding: '10px 0', color: '#94a3b8' }}>Amount</th>
                          <th style={{ padding: '10px 0', color: '#94a3b8' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentPayments?.map(p => (
                          <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 0', textTransform: 'uppercase' }}>{p.paymentMethod}</td>
                            <td style={{ padding: '12px 0', color: '#22c55e', fontWeight: '600' }}>+${p.amount}</td>
                            <td style={{ padding: '12px 0' }}>
                              <span style={{
                                color: '#4ade80',
                                background: 'rgba(34,197,94,0.1)',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.8rem'
                              }}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                        {stats.recentPayments?.length === 0 && (
                          <tr><td colSpan="3" style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8' }}>No transactions recorded.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* Add Room Form */}
          <div className="admin-form glass" style={{ padding: '30px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '400' }}>Add New Room</h2>
            <form onSubmit={handleRoomCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Room Number</label>
                <input
                  type="text"
                  required
                  style={{ marginTop: '5px' }}
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Room Type</label>
                <select
                  style={{ marginTop: '5px' }}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Standard">Standard Suite</option>
                  <option value="Deluxe">Deluxe Suite</option>
                  <option value="Suite">Presidential Suite</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Price Per Night ($)</label>
                <input
                  type="number"
                  required
                  style={{ marginTop: '5px' }}
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Description</label>
                <textarea
                  required
                  style={{ marginTop: '5px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Add Room</button>
            </form>
          </div>

          {/* Rooms List */}
          <div className="admin-list glass" style={{ padding: '30px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '400' }}>Manage Rooms</h2>
            {roomsLoading ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Loading rooms...</div>
            ) : roomsError ? (
              <div style={{ color: '#f87171' }}>{roomsError}</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Room #</th>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Type</th>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Price</th>
                      <th style={{ padding: '10px', color: '#94a3b8' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <tr key={room._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 10px' }}>{room.roomNumber}</td>
                        <td style={{ padding: '12px 10px' }}>{room.type}</td>
                        <td style={{ padding: '12px 10px' }}>${room.pricePerNight}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <button
                            onClick={() => handleRoomDelete(room._id)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#f87171', color: '#f87171' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rooms.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No rooms found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="glass" style={{ padding: '30px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '400' }}>System Reservations</h2>
          {bookingsLoading ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '50px' }}>Loading bookings...</div>
          ) : bookingsError ? (
            <div style={{ color: '#f87171' }}>{bookingsError}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Guest Name</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Email</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Check-In</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Check-Out</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Amount</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Status</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px 12px' }}>{b.userName}</td>
                      <td style={{ padding: '15px 12px', color: '#94a3b8' }}>{b.userEmail}</td>
                      <td style={{ padding: '15px 12px' }}>{new Date(b.checkInDate).toLocaleDateString()}</td>
                      <td style={{ padding: '15px 12px' }}>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                      <td style={{ padding: '15px 12px', fontWeight: '600' }}>${b.totalPrice}</td>
                      <td style={{ padding: '15px 12px' }}>
                        <span style={{
                          color: b.status === 'Cancelled' ? '#f87171' : '#4ade80',
                          background: b.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>{b.status}</span>
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        {b.status !== 'Cancelled' ? (
                          <button
                            onClick={() => handleBookingCancel(b._id)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#f87171', color: '#f87171' }}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No reservations in database.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. USERS TAB */}
      {activeTab === 'users' && (
        <div className="glass" style={{ padding: '30px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '400' }}>User Registrations</h2>
          {usersLoading ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '50px' }}>Loading customers...</div>
          ) : usersError ? (
            <div style={{ color: '#f87171' }}>{usersError}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Name</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Email Address</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Role</th>
                    <th style={{ padding: '12px', color: '#94a3b8' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px 12px' }}>{u.name}</td>
                      <td style={{ padding: '15px 12px', color: '#cbd5e1' }}>{u.email}</td>
                      <td style={{ padding: '15px 12px' }}>
                        <span style={{
                          color: u.isAdmin ? '#c084fc' : '#94a3b8',
                          background: u.isAdmin ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.05)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {u.isAdmin ? 'ADMIN' : 'CUSTOMER'}
                        </span>
                      </td>
                      <td style={{ padding: '15px 12px' }}>
                        {!u.isAdmin ? (
                          <button
                            onClick={() => handleUserPromote(u._id)}
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#c084fc', color: '#c084fc' }}
                          >
                            Promote to Admin
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No Actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No registered users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
