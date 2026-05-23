import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container hero animate-fade-in">
      <h1>Experience the Extraordinary.</h1>
      <p>Book your perfect stay with our premium selection of suites and rooms. Designed for comfort, built with microservices.</p>
      <Link to="/rooms" className="btn" style={{ padding: '15px 40px', fontSize: '1.2rem', display: 'inline-block' }}>
        Explore Rooms
      </Link>
    </div>
  );
};

export default Home;
