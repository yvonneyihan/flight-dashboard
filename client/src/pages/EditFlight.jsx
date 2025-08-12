import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditFlight.css';

const EditFlight = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState({
    FlightID: '',
    Airline: '',
    ScheduledDeparture: '',
    ScheduledArrival: '',
    DepartureAirport: '',
    ArrivalAirport: '',
    Note: ''
  });
  const [suggestions, setSuggestions] = useState({ DepartureAirport: [], ArrivalAirport: [] });

  useEffect(() => {
    fetch(`/users/manual-flights/${id}`) 
      .then((res) => res.json())
      .then((data) => {
        setFlight({
          FlightID: data.flightID,
          Airline: data.airline,
          ScheduledDeparture: new Date(data.departure).toISOString().slice(0, 16),
          ScheduledArrival: new Date(data.arrival).toISOString().slice(0, 16),
          DepartureAirport: data.depAirport || '',
          ArrivalAirport: data.arrAirport || '',
          Note: data.note || ''
        });
      })
      .catch((err) => console.error('❌ Failed to load flight data:', err));
  }, [id]);

  const handleChange = (e) => {
    setFlight({ ...flight, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/users/manual-flight/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flight),
      });

      if (res.ok) {
        navigate('/users/dashboard'); // redirect after success
      } else {
        console.error('❌ Update failed');
      }
    } catch (err) {
      console.error('❌ Error submitting form:', err);
    }
  };

  const handleAutocomplete = async (field, value) => {
    if (!value.trim()) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      return;
    }

    try {
      const res = await fetch(`/users/autocomplete?query=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [field]: data }));
    } catch (err) {
      console.error('❌ Autocomplete error:', err);
    }
  };

  return (
    <div className="edit-flight-container">
      <h1 className="page-title">✈️ Edit Manual Flight</h1>
      <form className="edit-form" onSubmit={handleSubmit}>
        <input type="text" name="FlightID" value={flight.FlightID} onChange={handleChange} required placeholder="Flight ID" />
        <input type="text" name="Airline" value={flight.Airline} onChange={handleChange} required placeholder="Airline" />
        <input type="datetime-local" name="ScheduledDeparture" value={flight.ScheduledDeparture} onChange={handleChange} required />
        <input type="datetime-local" name="ScheduledArrival" value={flight.ScheduledArrival} onChange={handleChange} />
        <div className="autocomplete-group"
            onBlur={() => setTimeout(() =>
              setSuggestions(prev => ({ ...prev, DepartureAirport: [] })), 100)}>
          <input
            name="DepartureAirport"
            value={flight.DepartureAirport}
            onChange={(e) => {
              handleChange(e); // updates flight state
              handleAutocomplete('DepartureAirport', e.target.value);
            }}
            placeholder="Departure Airport (IATA or city)"
            className="form-control"
            autoComplete="off"
          />
          {suggestions.DepartureAirport.length > 0 && (
            <div className="suggestions">
              {suggestions.DepartureAirport.map((s, i) => (
                <div
                  key={i}
                  className="suggestion-item"
                  onMouseDown={() => {
                    setFlight(prev => ({ ...prev, DepartureAirport: s.code }));
                    setSuggestions(prev => ({ ...prev, DepartureAirport: [] }));
                  }}
                >
                  {s.name} ({s.code})
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="autocomplete-group"
            onBlur={() => setTimeout(() =>
              setSuggestions(prev => ({ ...prev, ArrivalAirport: [] })), 100)}>
          <input
            name="ArrivalAirport"
            value={flight.ArrivalAirport}
            onChange={(e) => {
              handleChange(e); // updates flight state
              handleAutocomplete('ArrivalAirport', e.target.value);
            }}
            placeholder="Arrival Airport (IATA or city)"
            className="form-control"
            autoComplete="off"
          />
          {suggestions.ArrivalAirport.length > 0 && (
            <div className="suggestions">
              {suggestions.ArrivalAirport.map((s, i) => (
                <div
                  key={i}
                  className="suggestion-item"
                  onMouseDown={() => {
                    setFlight(prev => ({ ...prev, ArrivalAirport: s.code }));
                    setSuggestions(prev => ({ ...prev, ArrivalAirport: [] }));
                  }}
                >
                  {s.name} ({s.code})
                </div>
              ))}
            </div>
          )}
        </div>
        <input type="text" name="Note" value={flight.Note} onChange={handleChange} placeholder="Note" />
        <button type="submit">Save Changes</button>
      </form>
      <div className="back-link">
        <a href="/users/dashboard">Back to Dashboard</a>
      </div>
    </div>
  );
};

export default EditFlight;
