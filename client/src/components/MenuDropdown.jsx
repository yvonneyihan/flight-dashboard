import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/MenuDropdown.css';

function MenuDropdown() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/users/check-auth', { credentials: 'include' });
        const data = await res.json();
        setUserId(data.userId || null);
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, []);

  const handleMouseEnter = () => setMenuOpen(true);
  const handleMouseLeave = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="dropdown-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className="dropdown-toggle">☰ Menu</button>
      <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
        <Link to="/" className="dropdown-item">Home</Link>
        <Link to="/heatmap" className="dropdown-item">Popular Flights Map</Link>
        <Link to="/predictions" className="dropdown-item">Price Prediction</Link>
        {!userId && (
          <Link to="/login" className="dropdown-item">Log In</Link>
        )}
        {userId && (
          <>
            <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
            <button type="button" className="dropdown-item" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MenuDropdown;