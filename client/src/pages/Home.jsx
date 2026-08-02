import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Home.css';
import { FiSearch, FiRotateCcw, FiArrowRight, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import AutocompleteInput from '../components/Autocomplete';

const statusClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('delay')) return 'delayed';
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('time')) return 'on-time';
  return 'on-time';
};

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

  const [userId, setUserId] = useState(null);

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
    fetch('/api/users/check-auth', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setUserId(data.authenticated ? data.userId : null);
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

    await fetch('/api/flights/popular_routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dep: filters.dep, arr: filters.arr })
    });
    fetchFlights();
  };

  const handleReset = () => {
    const resetFilters = { dep: '', arr: '', airline: '', from: '', to: '' };
    setFilters(resetFilters);
    setSearchParams({});
    fetchFlights(resetFilters);
  };

  const handleLike = async (flightId) => {
    if (myVotes[flightId] === 'like') {
      toast.info('You already liked this flight.');
      return;
    }
    try {
      const res = await fetch(`/api/flights/${flightId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const maxCount = popularRoutes.length ? Math.max(...popularRoutes.map(r => r.searchCount)) : 1;

  return (
    <div className="sl-page">
      <div className="sl-page-head">
        <div>
          <h1 className="sl-page-title">Search Flights</h1>
          <p className="sl-page-sub">Find routes, compare prices, and see what other travelers think</p>
        </div>
        {userId && <span className="sl-pill-muted">Logged in as user #{userId}</span>}
      </div>

      <form onSubmit={handleSubmit} className="sl-card sl-search-card">
        <div className="sl-search-grid">
          <div className="sl-field">
            <label className="sl-label">Departure Airport</label>
            <AutocompleteInput
              label="Departure Airport"
              name="dep"
              value={filters.dep}
              onChange={handleInputChange}
              fetchUrl="/api/users/autocomplete"
            />
          </div>
          <div className="sl-field">
            <label className="sl-label">Arrival Airport</label>
            <AutocompleteInput
              label="Arrival Airport"
              name="arr"
              value={filters.arr}
              onChange={handleInputChange}
              fetchUrl="/api/users/autocomplete"
            />
          </div>
          <div className="sl-field">
            <label className="sl-label">Airline</label>
            <AutocompleteInput
              label="Airline"
              name="airline"
              value={filters.airline}
              onChange={handleInputChange}
              fetchUrl="/api/users/autocomplete/airlines"
              valueField="name"
            />
          </div>
          <div className="sl-field">
            <label className="sl-label">Departure</label>
            <input type="datetime-local" name="from" value={filters.from} onChange={handleInputChange} className="sl-input" />
          </div>
          <div className="sl-field">
            <label className="sl-label">Return</label>
            <input type="datetime-local" name="to" value={filters.to} onChange={handleInputChange} className="sl-input" />
          </div>
        </div>
        <div className="sl-search-actions">
          <button type="submit" className="sl-btn-primary"><FiSearch size={14} /> Search Flights</button>
          <button type="button" onClick={handleReset} className="sl-btn-secondary"><FiRotateCcw size={14} /> Reset</button>
        </div>
      </form>

      <div className="sl-results-row">
        <div className="sl-card sl-results-card">
          <div className="sl-card-head">
            <div>
              <h2 className="sl-card-title">Flight Results</h2>
              <p className="sl-card-sub">
                {flights.length > 0 ? `${flights.length} flight${flights.length === 1 ? '' : 's'} found` : 'No matching flights found'}
              </p>
            </div>
          </div>
          <div className="sl-table-scroll">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Times</th>
                  <th>Status</th>
                  <th>Sentiment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight, i) => (
                  <tr key={i}>
                    <td>
                      <p className="sl-strong">{flight.Airline}</p>
                      <p className="sl-muted mono sl-small">{flight.FlightID}</p>
                    </td>
                    <td>
                      <div className="sl-route">
                        <span className="sl-route-leg" title={flight.DepartureAirport}>{flight.DepartureAirport}</span>
                        <FiArrowRight size={12} className="sl-muted sl-route-arrow" />
                        <span className="sl-route-leg" title={flight.ArrivalAirport}>{flight.ArrivalAirport}</span>
                      </div>
                    </td>
                    <td className="mono sl-small">
                      <div>{new Date(flight.ScheduledDeparture).toLocaleString('en-CA', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="sl-muted">{new Date(flight.ScheduledArrival).toLocaleString('en-CA', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td>
                      <span className={`sl-status-pill ${statusClass(flight.Status)}`}>
                        <span className="dot" />
                        {flight.Status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <div className="sl-sentiment">
                        <button
                          onClick={() => handleLike(flight.FlightID)}
                          aria-pressed={myVotes[flight.FlightID] === 'like'}
                          className={`sl-vote-btn ${myVotes[flight.FlightID] === 'like' ? 'liked' : ''}`}
                        >
                          <FiThumbsUp size={13} />
                          <span className="mono">{Number(flight.Likes) || 0}</span>
                        </button>
                        <button
                          onClick={() => handleDislike(flight.FlightID)}
                          aria-pressed={myVotes[flight.FlightID] === 'dislike'}
                          className={`sl-vote-btn ${myVotes[flight.FlightID] === 'dislike' ? 'disliked' : ''}`}
                        >
                          <FiThumbsDown size={13} />
                          <span className="mono">{Number(flight.Dislikes) || 0}</span>
                        </button>
                      </div>
                    </td>
                    <td>
                      <Link to={`/flights/${flight.FlightID}/reviews`} className="sl-link">Reviews →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sl-card sl-routes-card">
          <div className="sl-card-head">
            <h2 className="sl-card-title">Most Searched Routes</h2>
            <p className="sl-card-sub">All-time · all airlines</p>
          </div>
          <div className="sl-routes-list">
            {popularRoutes.length === 0 && <p className="sl-muted sl-small">No search history yet.</p>}
            {popularRoutes.map((route, i) => (
              <div key={i} className="sl-route-row">
                <div className="sl-route-row-head">
                  <span className="sl-muted mono sl-small">{i + 1}</span>
                  <span className="mono sl-route-label">{route.depAirport} → {route.arrAirport}</span>
                  <span className="sl-muted mono sl-small">{route.searchCount}</span>
                </div>
                <div className="sl-route-bar-track">
                  <div className="sl-route-bar-fill" style={{ width: `${(route.searchCount / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;