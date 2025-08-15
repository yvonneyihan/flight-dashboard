import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditFlight.css';
import AutocompleteInput from '../components/Autocomplete';

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
    fetch(`/api/users/manual-flights/${id}`) 
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
      const res = await fetch(`/api/users/manual-flight/${id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flight),
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        console.error('❌ Update failed');
      }
    } catch (err) {
      console.error('❌ Error submitting form:', err);
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
        <div className="form-group">
          <AutocompleteInput
            label="Departure Airport"
            name="DepartureAirport"
            value={flight.DepartureAirport}
            onChange={handleChange}
            fetchUrl="/api/users/autocomplete"
            required
          />
        </div>

        <div className="form-group">
          <AutocompleteInput
            label="Arrival Airport"
            name="ArrivalAirport"
            value={flight.ArrivalAirport}
            onChange={handleChange}
            fetchUrl="/api/users/autocomplete"
            required
          />
        </div>
        <input type="text" name="Note" value={flight.Note} onChange={handleChange} placeholder="Note" />
        <button type="submit">Save Changes</button>
      </form>
      <div className="back-link">
        <a href="/dashboard">Back to Dashboard</a>
      </div>
    </div>
  );
};

export default EditFlight;
