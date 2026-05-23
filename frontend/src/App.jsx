import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Auth from './pages/Auth';
import Bookings from './pages/Bookings';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
