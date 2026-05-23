import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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
    navigate('/');
  };

  return (
    <nav className="glass">
      <Link to="/" className="logo">LUXE.</Link>
      <div className="links">
        <Link to="/rooms">Rooms</Link>
        {token && <Link to="/bookings">My Bookings</Link>}
        {isAdmin && <Link to="/admin" style={{ color: '#d4af37', fontWeight: 'bold' }}>Admin Panel</Link>}
        {token ? (
          <button onClick={handleLogout} className="btn btn-outline" style={{ marginLeft: '15px' }}>Logout</button>
        ) : (
          <Link to="/auth" className="btn">Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
