import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import AutocompleteInput from '../components/Autocomplete';
import MenuDropdown from '../components/MenuDropdown';

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
  const [userId, setUserId] = useState(null);

  // Fetch manual flights only
  const fetchFlights = async () => {
    try {
      const manualsRes = await fetch('/api/users/manual-flights', { credentials: 'include' });
      const manualsData = await manualsRes.json();
      setManuals(manualsData);
    } catch (err) {
      console.error('❌ Fetch flights failed:', err);
    }
  };

  // Fetch data from backend
  useEffect(() => {
    const checkAndFetch = async () => {
      try {
        // Check session
        const res = await fetch('/api/users/check-auth', { credentials: 'include' });
        const data = await res.json();
        setUserId(data.userId);
        if (!data.authenticated) {
          window.location.href = '/api/users/login'; 
          return;
        }

        // Fetch searches
        const searchesRes = await fetch('/api/users/searches', { credentials: 'include' });
        const searchesData = await searchesRes.json();
        setSearches(searchesData);

        // Fetch manual flights
        const manualsRes = await fetch('/api/users/manual-flights', { credentials: 'include' });
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
    fetch('/api/users/manual-flight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchFlights(); 
          setForm({
            FlightID: '',
            Airline: '',
            ScheduledDeparture: '',
            ScheduledArrival: '',
            DepartureAirport: '',
            ArrivalAirport: '',
            Note: ''
          })
        }
      })
      .catch(console.error);
  };

  const handleSearchAgain = async (id) => {
    try {
      const res = await fetch(`/api/users/search-again/${id}`, {
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
      const res = await fetch(`/api/users/manual-flight/${id}`, {
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
  return (
    <div className="dashboard-container">
      <header className="header">
        <div style={{ width: '80px' }} />
        <h1 className="dashboard-header">Welcome to Your Dashboard</h1>
        <MenuDropdown />
      </header>
      {userId && <p className="user-status" style={{ color: 'white' }}>🔐 Logged in as user ID {userId}</p>}
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
                  <Link to={`/manual-flights/edit/${m.id}`}>
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
            <AutocompleteInput
              label="Departure Airport"
              name="DepartureAirport"
              value={form.DepartureAirport}
              onChange={handleChange}
              fetchUrl="/api/users/autocomplete"
              required
            />
          </div>

          <div className="form-group">
            <AutocompleteInput
              label="Arrival Airport"
              name="ArrivalAirport"
              value={form.ArrivalAirport}
              onChange={handleChange}
              fetchUrl="/api/users/autocomplete"
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
          <button type="submit">Save Flight</button>
        </form>
      </section>
    </div>
  );
};

export default Dashboard;
