import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiArrowRight, FiX, FiPlay } from 'react-icons/fi';
import AutocompleteInput from '../components/Autocomplete';

const Dashboard = () => {
  const [searches, setSearches] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [showAddFlight, setShowAddFlight] = useState(false);
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

  const fetchFlights = async () => {
    try {
      const manualsRes = await fetch('/api/users/manual-flights', { credentials: 'include' });
      const manualsData = await manualsRes.json();
      setManuals(manualsData);
    } catch (err) {
      console.error('❌ Fetch flights failed:', err);
    }
  };

  useEffect(() => {
    const checkAndFetch = async () => {
      try {
        const res = await fetch('/api/users/check-auth', { credentials: 'include' });
        const data = await res.json();
        setUserId(data.userId);
        if (!data.authenticated) {
          window.location.href = '/login';
          return;
        }

        const searchesRes = await fetch('/api/users/searches', { credentials: 'include' });
        const searchesData = await searchesRes.json();
        setSearches(searchesData);

        const manualsRes = await fetch('/api/users/manual-flights', { credentials: 'include' });
        const manualsData = await manualsRes.json();
        setManuals(manualsData);
      } catch (err) {
        console.error('❌ Dashboard load failed:', err);
      }
    };

    checkAndFetch();
  }, []);

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
          });
          setShowAddFlight(false);
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
    <div className="sl-page">
      <div className="sl-page-head">
        <div>
          <h1 className="sl-page-title">Dashboard</h1>
          <p className="sl-page-sub">Manage your saved flights and search history</p>
        </div>
        {userId && <span className="sl-pill-muted">Logged in as user #{userId}</span>}
      </div>

      <div className="sl-card">
        <div className="sl-card-head">
          <div>
            <h2 className="sl-card-title">My Flights</h2>
            <p className="sl-card-sub">{manuals.length} saved itineraries</p>
          </div>
          <button className="sl-btn-primary" onClick={() => setShowAddFlight(true)}>
            <FiPlus size={14} /> Add Flight
          </button>
        </div>
        {manuals.length === 0 ? (
          <div className="sl-empty-state">
            <p className="sl-strong">No saved flights</p>
            <button className="sl-link" onClick={() => setShowAddFlight(true)}>Add your first flight</button>
          </div>
        ) : (
          <div className="sl-table-scroll">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Flight ID</th>
                  <th>Route</th>
                  <th>Airline</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {manuals.map(m => (
                  <tr key={m.id}>
                    <td className="mono">{m.flightID}</td>
                    <td>
                      <div className="sl-route mono">
                        <span>{m.depAirport}</span>
                        <FiArrowRight size={12} className="sl-muted" />
                        <span>{m.arrAirport}</span>
                      </div>
                    </td>
                    <td className="sl-muted">{m.airline}</td>
                    <td className="mono sl-small">{new Date(m.departure).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="mono sl-small">{new Date(m.arrival).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="sl-muted sl-small">{m.note}</td>
                    <td>
                      <div className="sl-row-actions">
                        <Link to={`/manual-flights/edit/${m.id}`} className="sl-icon-btn" aria-label="Edit">
                          <FiEdit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(m.id)} className="sl-icon-btn danger" aria-label="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="sl-card">
        <div className="sl-card-head">
          <div>
            <h2 className="sl-card-title">Recent Searches</h2>
            <p className="sl-card-sub">{searches.length} saved queries</p>
          </div>
        </div>
        {searches.length === 0 ? (
          <div className="sl-empty-state">
            <p className="sl-strong">No recent searches</p>
          </div>
        ) : (
          <div className="sl-table-scroll">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Airline</th>
                  <th>Date range</th>
                  <th>Saved at</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {searches.map(s => {
                  const params = new URLSearchParams(s.searchQuery.slice(2));
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="sl-route mono">
                          <span>{params.get('dep') || '-'}</span>
                          <FiArrowRight size={12} className="sl-muted" />
                          <span>{params.get('arr') || '-'}</span>
                        </div>
                      </td>
                      <td className="sl-muted">{params.get('airline') || 'All airlines'}</td>
                      <td className="sl-muted sl-small">{params.get('from') || '-'} ~ {params.get('to') || '-'}</td>
                      <td className="mono sl-small">{new Date(s.createdAt).toLocaleString()}</td>
                      <td>
                        <button onClick={() => handleSearchAgain(s.id)} className="sl-icon-btn" aria-label="Search again">
                          <FiPlay size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddFlight && (
        <div className="sl-slideover-overlay" onClick={() => setShowAddFlight(false)}>
          <div className="sl-slideover" onClick={(e) => e.stopPropagation()}>
            <div className="sl-slideover-head">
              <div>
                <h3 className="sl-card-title">Add Flight</h3>
                <p className="sl-card-sub">Save a manual itinerary</p>
              </div>
              <button className="sl-icon-btn" onClick={() => setShowAddFlight(false)} aria-label="Close">
                <FiX size={16} />
              </button>
            </div>
            <form className="sl-slideover-body" onSubmit={handleManualFlightSubmit}>
              <div className="sl-field">
                <label className="sl-label">Flight ID</label>
                <input type="text" name="FlightID" value={form.FlightID} onChange={handleChange} placeholder="UA 428" className="sl-input" required />
              </div>
              <div className="sl-field">
                <label className="sl-label">Airline</label>
                <AutocompleteInput
                  label="Airline"
                  name="Airline"
                  value={form.Airline}
                  onChange={handleChange}
                  fetchUrl="/api/users/autocomplete/airlines"
                  valueField="name"
                  required
                />
              </div>
              <div className="sl-field">
                <label className="sl-label">Departure</label>
                <input type="datetime-local" name="ScheduledDeparture" value={form.ScheduledDeparture} onChange={handleChange} className="sl-input" required />
              </div>
              <div className="sl-field">
                <label className="sl-label">Arrival</label>
                <input type="datetime-local" name="ScheduledArrival" value={form.ScheduledArrival} onChange={handleChange} className="sl-input" required />
              </div>
              <div className="sl-field">
                <label className="sl-label">Departure Airport</label>
                <AutocompleteInput
                  label="Departure Airport"
                  name="DepartureAirport"
                  value={form.DepartureAirport}
                  onChange={handleChange}
                  fetchUrl="/api/users/autocomplete"
                  required
                />
              </div>
              <div className="sl-field">
                <label className="sl-label">Arrival Airport</label>
                <AutocompleteInput
                  label="Arrival Airport"
                  name="ArrivalAirport"
                  value={form.ArrivalAirport}
                  onChange={handleChange}
                  fetchUrl="/api/users/autocomplete"
                  required
                />
              </div>
              <div className="sl-field">
                <label className="sl-label">Note</label>
                <input type="text" name="Note" value={form.Note} onChange={handleChange} placeholder="Optional note" className="sl-input" />
              </div>
              <div className="sl-slideover-actions">
                <button type="button" className="sl-btn-secondary" onClick={() => setShowAddFlight(false)}>Cancel</button>
                <button type="submit" className="sl-btn-primary">Save Flight</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;