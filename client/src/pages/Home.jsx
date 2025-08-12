import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Home.css';
import { FaSearch, FaUndo } from 'react-icons/fa';
import AutocompleteInput from '../components/Autocomplete';


const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [myVotes, setMyVotes] = useState({});
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [filters, setFilters] = useState({
    dep: searchParams.get('dep') || '',
    arr: searchParams.get('arr') || '',
    airline: searchParams.get('airline') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || ''
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const handleMouseEnter = () => setMenuOpen(true);
  const handleMouseLeave = () => setMenuOpen(false);
  const fetchFlights = async (overrideFilters) => {
    const params = new URLSearchParams(overrideFilters || filters);
    try {
      const res = await fetch(`/api/flights?${params}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      const text = await res.text();
      if (!text) {
        setFlights([]);
        setPopularRoutes([]);
        return;
      }
      const data = JSON.parse(text);
      setFlights(data.flights || []);
      setPopularRoutes(data.popularRoutes || []);
    } catch (error) {
      console.error('❌ Failed to fetch flights:', error);
      setFlights([]);
      setPopularRoutes([]);
    }
  };

  useEffect(() => {
    fetch('/users/check-auth', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUserId(data.userId);
        } else {
          setUserId(null);
        }
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!filters.dep || !filters.arr || 
      !String(filters.dep).trim() || 
      !String(filters.arr).trim()) {
      alert("Please enter both departure and arrival airports.");
      return; 
    }

    setSearchParams(filters);

    // Increment PopularRoutes
    await fetch('/api/flights/popular_routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dep: filters.dep, arr: filters.arr })
    });
    fetchFlights();
  };

  const handleLike = async (flightId) => {
    if (myVotes[flightId] === 'like') {
      toast.info('You already liked this flight.');
      return;
    }
    try {
      const res = await fetch(`/api/flights/${flightId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include'
      });

      if (res.status === 401) {
        toast.warn('Please log in to vote on flights.');
        return;
      }
      if (!res.ok) {
        toast.error('Failed to like flight.');
        return;
      }
      const { counts } = await res.json();
      setFlights(prev =>
        prev.map(f => f.FlightID === flightId
          ? { ...f, Likes: counts.Likes, Dislikes: counts.Dislikes }
          : f
        )
      );
      setMyVotes(prev => ({ ...prev, [flightId]: 'like' }));
      toast.success('Liked!');
    } catch {
      toast.error('Network error. Try again.');
    }
  };

  const handleDislike = async (flightId) => {
    if (myVotes[flightId] === 'dislike') {
      toast.info('You already disliked this flight.');
      return;
    }
    try {
      const res = await fetch(`/api/flights/${flightId}/dislike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.status === 401) {
        toast.warn('Please log in to vote on flights.');
        return;
      }

      if (!res.ok) {
        toast.error('Failed to dislike flight.');
        return;
      }

      const { counts } = await res.json();
      setFlights(prev =>
        prev.map(f =>
          f.FlightID === flightId
            ? { ...f, Likes: counts.Likes, Dislikes: counts.Dislikes }
            : f
        )
      );
      setMyVotes(prev => ({ ...prev, [flightId]: 'dislike' }));
      toast.success('Disliked!');
    } catch {
      toast.error('Network error. Try again.');
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/users/logout', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Logout failed.');
        return;
      }

      if (res.ok) {
        alert('Logout successful.');
        navigate('/'); 
      } else {
        const data = await res.json();
        alert(data.error || 'Logout failed.');
      }
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  };

  return (
    <div className="home-container">
      <header className="header">
        <div className="dropdown-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <button className="dropdown-toggle">☰ Menu</button>
          <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
            <Link to="/heatmap" className="dropdown-item">Popular Flights Map</Link>
            {!userId && (
              <>
                <Link to="/users/login" className="dropdown-item">Log In</Link>
              </>
            )}

            {userId && (
              <>
                <Link to="/users/dashboard" className="dropdown-item">Dashboard</Link>
                <button type="button" className="dropdown-item" onClick={handleLogout}>
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <h1 className="page-title">📋 Flight Schedule</h1>
      {userId && <p className="user-status">🔐 Logged in as user ID {userId}</p>}

      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-row">
          <div className="home-form-group">
            <AutocompleteInput
              label="Departure Airport"
              name="dep"
              value={filters.dep}
              onChange={handleInputChange}
              fetchUrl="/users/autocomplete"
            />
          </div>
          <div className="home-form-group">
            <AutocompleteInput
              label="Arrival Airport"
              name="arr"
              value={filters.arr}
              onChange={handleInputChange}
              fetchUrl="/users/autocomplete"
            />
          </div>
          <div className="home-form-group">
          <input name="airline" value={filters.airline} onChange={handleInputChange} placeholder="Airline" className="form-control" />
          </div>
          <div className="home-form-group">
          <input type="datetime-local" name="from" value={filters.from} onChange={handleInputChange} className="form-control" />
          </div>
          <div className="home-form-group">
          <input type="datetime-local" name="to" value={filters.to} onChange={handleInputChange} className="form-control" />
          </div>
          <div className="home-form-group">
            <div className="button-group">
              <button type="submit" className="primary-btn"><FaSearch /> Search</button>
              <button type="button" 
              onClick={() => { 
                  const resetFilters = { dep: '', arr: '', airline: '', from: '', to: '' };
                  setFilters(resetFilters);
                  setSearchParams({}); 
                  fetchFlights(resetFilters); 
                }} 
                className="reset-btn"
              >
                <FaUndo /> Reset
              </button>
            </div>
          </div>
        </div>
      </form>

      <p className="results-message">
        {flights.length > 0 ? `${flights.length} flight${flights.length === 1 ? '' : 's'} found.` : 'No matching flights found.'}
      </p>

      <table className="flight-table">
        <thead>
          <tr>
            <th>Flight ID</th>
            <th>Airline</th>
            <th>Status</th>
            <th>Departure Time</th>
            <th>Departure Airport</th>
            <th>Arrival Time</th>
            <th>Arrival Airport</th>
            <th>Likes</th>
            <th>Dislikes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, i) => (
            <tr key={i}>
              <td>{flight.FlightID}</td>
              <td>{flight.Airline}</td>
              <td>{flight.Status}</td>
              <td>{new Date(flight.ScheduledDeparture).toLocaleString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit' 
              })}</td>
              <td>{flight.DepartureAirport}</td>
              <td>{new Date(flight.ScheduledArrival).toLocaleString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit' 
              })}</td>
              <td>{flight.ArrivalAirport}</td>
              <td>{Number(flight.Likes) || 0}</td>
              <td>{Number(flight.Dislikes) || 0}</td>
              <td>
                <Link to={`/flights/${flight.FlightID}/reviews`} className="button-link green">
                  View Reviews
                </Link>
                <div className="button-group">
                  <button
                    onClick={() => handleLike(flight.FlightID)}
                    aria-pressed={myVotes[flight.FlightID] === 'like'}
                  >
                    👍 
                  </button>
                  <button
                    onClick={() => handleDislike(flight.FlightID)}
                    aria-pressed={myVotes[flight.FlightID] === 'dislike'}
                  >
                    👎 
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="section-heading">✈️ Most Searched Routes</h2>
      <table className="popular-routes-table">
        <thead>
          <tr>
            <th>Departure Airport</th>
            <th>Arrival Airport</th>
            <th>Search Count</th>
          </tr>
        </thead>
        <tbody>
          {popularRoutes.map((route, i) => (
            <tr key={i}>
              <td>{route.depAirport}</td>
              <td>{route.arrAirport}</td>
              <td>{route.searchCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
