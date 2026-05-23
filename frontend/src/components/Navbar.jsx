import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="glass">
      <Link to="/" className="logo">LUXE.</Link>
      <div className="links">
        <Link to="/rooms">Rooms</Link>
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
