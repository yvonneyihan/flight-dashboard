import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import AutocompleteInput from '../components/Autocomplete';

const Dashboard = () => {
  const [searches, setSearches] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [form, setForm] = useState({
    FlightID: '',
    Airline: '',
    ScheduledDeparture: '',
    ScheduledArrival: '',
    DepartureAirport: '',
    ArrivalAirport: '',
    Note: ''
  });
  const navigate = useNavigate();

  // Fetch data from backend
  useEffect(() => {
    const checkAndFetch = async () => {
      try {
        // Check session
        const res = await fetch('/users/check-auth', { credentials: 'include' });
        const data = await res.json();
        if (!data.authenticated) {
          window.location.href = '/users/login'; 
          return;
        }

        // Fetch searches
        const searchesRes = await fetch('/users/searches', { credentials: 'include' });
        const searchesData = await searchesRes.json();
        setSearches(searchesData);

        // Fetch manual flights
        const manualsRes = await fetch('/users/manual-flights', { credentials: 'include' });
        const manualsData = await manualsRes.json();
        setManuals(manualsData);
      } catch (err) {
        console.error('❌ Dashboard load failed:', err);
      }
    };

    checkAndFetch();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleManualFlightSubmit = (e) => {
    e.preventDefault();
    fetch('/users/manual-flight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(() => window.location.reload())
      .catch(console.error);
  };

  const handleSearchAgain = async (id) => {
    try {
      const res = await fetch(`/users/search-again/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Search fetch failed');
      const data = await res.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error('❌ Search again failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/users/manual-flight/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        window.location.reload(); 
      } else {
        console.error('❌ Delete failed');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
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
    <div className="dashboard-container">
      <h2>Welcome to Your Dashboard</h2>

      <section>
        <h3>Recent Searches</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Airline</th>
              <th>Date Range</th>
              <th>Saved At</th>
              <th>Search</th>
            </tr>
          </thead>
          <tbody>
            {searches.map(s => {
              const params = new URLSearchParams(s.searchQuery.slice(2));
              return (
                <tr key={s.id}>
                  <td>{params.get('dep') || '-'}</td>
                  <td>{params.get('arr') || '-'}</td>
                  <td>{params.get('airline') || '-'}</td>
                  <td>{params.get('from') || '-'} ~ {params.get('to') || '-'}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleSearchAgain(s.id)}>
                      Search Again
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h3>My Flights</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Flight ID</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Airline</th>
              <th>Route</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {manuals.map(m => (
              <tr key={m.id}>
                <td>{m.flightID}</td>
                <td>{new Date(m.departure).toLocaleString('en-US', {
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}</td>

                <td>{new Date(m.arrival).toLocaleString('en-US', {
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}</td>
                <td>{m.airline}</td>
                <td>{m.depAirport} ~ {m.arrAirport}</td>
                <td>{m.note}</td>
                <td>
                  <button
                    onClick={() => handleDelete(m.id)}
                    style={{ marginRight: '8px' }}
                  >
                    Delete
                  </button>
                  <Link to={`/users/manual-flights/edit/${m.id}`}>
                    <button>Edit</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Add Flight</h3>
        <form className="add-flight-form" onSubmit={handleManualFlightSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="FlightID"
              value={form.FlightID}
              onChange={handleChange}
              placeholder="Flight ID"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="Airline"
              value={form.Airline}
              onChange={handleChange}
              placeholder="Airline"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="datetime-local"
              name="ScheduledDeparture"
              value={form.ScheduledDeparture}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="datetime-local"
              name="ScheduledArrival"
              value={form.ScheduledArrival}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="Note"
              value={form.Note}
              onChange={handleChange}
              placeholder="Note"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <AutocompleteInput
              label="Departure Airport"
              name="DepartureAirport"
              value={form.DepartureAirport}
              onChange={handleChange}
              fetchUrl="/users/autocomplete"
              required
            />
          </div>

          <div className="form-group">
            <AutocompleteInput
              label="Arrival Airport"
              name="ArrivalAirport"
              value={form.ArrivalAirport}
              onChange={handleChange}
              fetchUrl="/users/autocomplete"
              required
            />
          </div>

          <button type="submit">Save Flight</button>
        </form>
      </section>

      <footer style={{ marginTop: '40px' }}>
        <a href="/" className="nav-link">Back to Home</a> |{' '}
        <button type="button" className="dropdown-item" onClick={handleLogout}>
          Log Out
        </button>
      </footer>
    </div>
  );
};

export default Dashboard;
